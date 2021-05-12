package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration

import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DynamicFrameworkContractRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceProviderRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory

@Import(MockAuthContext::class)
class ReferralTest : IntegrationTestBase() {
  var referralFactory = ReferralFactory()
  val tokenFactory = JwtTokenFactory()

  @Autowired
  lateinit var referralRepository: ReferralRepository
  @Autowired
  lateinit var authUserRepository: AuthUserRepository
  @Autowired
  lateinit var interventionRepository: InterventionRepository
  @Autowired
  lateinit var dynamicFrameWorkContractRepository: DynamicFrameworkContractRepository
  @Autowired
  lateinit var serviceCategoryRepository: ServiceCategoryRepository
  @Autowired
  lateinit var serviceProviderRepository: ServiceProviderRepository

  @MockBean
  lateinit var mockAuth: HMPPSAuthService

  @Nested
  inner class GetSentReferral {
    var referral = referralFactory.createSent()
    @BeforeEach
    fun dataSetup() {
      authUserRepository.save(referral.createdBy)
      serviceProviderRepository.save(referral.intervention.dynamicFrameworkContract.primeProvider)
      serviceCategoryRepository.save(referral.intervention.dynamicFrameworkContract.serviceCategory)
      dynamicFrameWorkContractRepository.save(referral.intervention.dynamicFrameworkContract)
      interventionRepository.save(referral.intervention)
      referralRepository.save(referral)
    }
    @Test
    fun `GetSentReferral returns OK when user has referral service provider access`() {
      val requestingUser = AuthUserFactory().create("USER_1", "auth", "user.1")
      authUserRepository.save(requestingUser)
      whenever(mockAuth.getServiceProviderOrganizationForUser(requestingUser)).thenReturn(referral.intervention.dynamicFrameworkContract.primeProvider.id)
      val token = tokenFactory.createEncodedToken(userID = requestingUser.id, userName = requestingUser.userName, authSource = requestingUser.authSource)
      webTestClient.get()
        .uri("/sent-referral/${referral.id}")
        .headers { http -> http.setBearerAuth(token) }
        .exchange()
        .expectStatus()
        .isOk
    }

    @Test
    fun `GetSentReferral returns Unauthorized when user does not have referral service provider access`() {
      val requestingUser = AuthUserFactory().create("USER_1", "auth", "user.1")
      authUserRepository.save(requestingUser)
      whenever(mockAuth.getServiceProviderOrganizationForUser(requestingUser)).thenReturn("SOME_OTHER_PROVIDER")
      val token = tokenFactory.createEncodedToken(userID = requestingUser.id, userName = requestingUser.userName, authSource = requestingUser.authSource)
      webTestClient.get()
        .uri("/sent-referral/${referral.id}")
        .headers { http -> http.setBearerAuth(token) }
        .exchange()
        .expectStatus()
        .isUnauthorized
        .expectBody()
        .jsonPath("message")
        .isEqualTo("unauthorized to access referral [id=${referral!!.id}]")
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration

import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.util.Lists
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.boot.test.mock.mockito.MockBean
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory

class ReferralAccessTest : IntegrationTestBase() {
  val tokenFactory = JwtTokenFactory()
  val primeProviderId = "HARMONY_LIVING"
  val subcontractorProviderId = "SUB_CONTRACTOR"
  val primeContractReference = "123456"
  val subcontracterReference = "54321"

  val primeServiceProviderAuthGroup = "INT_SP_$primeProviderId"
  val subContractorServiceProviderAuthGroup = "INT_SP_$subcontractorProviderId"

  val primeContractGroupAuthGroup = "INT_CG_$primeContractReference"
  val subcontractorContractGroupAuthGroup = "INT_CG_$subcontracterReference"
  lateinit var referral: Referral

  @BeforeEach
  fun dataSetup() {
    val contract = setupAssistant.createDynamicFrameworkContract(
      contractReference = primeContractReference, primeProviderId = primeProviderId,
      subContractorServiceProviderIds = setOf(subcontractorProviderId)
    )
    referral = setupAssistant.createSentReferral(intervention = setupAssistant.createIntervention(dynamicFrameworkContract = contract))
  }

  @MockBean
  lateinit var mockHmppsAuthService: HMPPSAuthService

  @Nested
  inner class GetSentReferral {
    @Test
    fun `GetSentReferral returns OK when user is of prime provider and allowed to work on prime provider contract groups`() {
      val requestingUser = setupAssistant.createSPUser()
      whenever(mockHmppsAuthService.getUserGroups(requestingUser)).thenReturn(listOf(primeServiceProviderAuthGroup, primeContractGroupAuthGroup))
      val token = tokenFactory.createEncodedToken(userID = requestingUser.id, userName = requestingUser.userName, authSource = requestingUser.authSource)
      webTestClient.get()
        .uri("/sent-referral/${referral.id}")
        .headers { http -> http.setBearerAuth(token) }
        .exchange()
        .expectStatus()
        .isOk
    }

    @Test
    fun `GetSentReferral returns OK when user is a subcontractor and is allowed to work on prime contract`() {
      val requestingUser = setupAssistant.createSPUser()
      whenever(mockHmppsAuthService.getUserGroups(requestingUser)).thenReturn(Lists.list(subContractorServiceProviderAuthGroup, primeContractGroupAuthGroup))
      val token = tokenFactory.createEncodedToken(userID = requestingUser.id, userName = requestingUser.userName, authSource = requestingUser.authSource)
      webTestClient.get()
        .uri("/sent-referral/${referral.id}")
        .headers { http -> http.setBearerAuth(token) }
        .exchange()
        .expectStatus()
        .isOk
    }

    @Test
    fun `GetSentReferral returns Unauthorized when user is a subcontractor but does not have prime contract access`() {
      setupAssistant.createDynamicFrameworkContract(
        contractReference = subcontracterReference, primeProviderId = subcontractorProviderId,
        subContractorServiceProviderIds = setOf()
      )
      val requestingUser = setupAssistant.createSPUser()
      whenever(mockHmppsAuthService.getUserGroups(requestingUser)).thenReturn(Lists.list(subContractorServiceProviderAuthGroup, subcontractorContractGroupAuthGroup))
      val token = tokenFactory.createEncodedToken(userID = requestingUser.id, userName = requestingUser.userName, authSource = requestingUser.authSource)
      webTestClient.get()
        .uri("/sent-referral/${referral.id}")
        .headers { http -> http.setBearerAuth(token) }
        .exchange()
        .expectStatus()
        .isUnauthorized
        .expectBody()
        .jsonPath("message")
        .isEqualTo("unauthorized to access referral [id=${referral.id}]")
    }
  }
}

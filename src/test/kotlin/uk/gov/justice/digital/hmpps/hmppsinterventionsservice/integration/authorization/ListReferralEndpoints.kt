package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.authorization

import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.boot.test.mock.mockito.MockBean
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.IntegrationTestBase
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory

class ListReferralEndpoints : IntegrationTestBase() {
  @MockBean
  lateinit var mockHmppsAuthService: HMPPSAuthService

  private lateinit var requestFactory: RequestFactory

  private val tokenFactory = JwtTokenFactory()

  @BeforeEach
  fun initRequestBuilder() {
    requestFactory = RequestFactory(webTestClient, setupAssistant)
  }

  private fun setUserGroups(user: AuthUser, groups: List<String>?) {
    whenever(mockHmppsAuthService.getUserGroups(user)).thenReturn(groups)
  }

  private fun createSentReferral(contract: DynamicFrameworkContract): Referral {
    return setupAssistant.createSentReferral(intervention = setupAssistant.createIntervention(dynamicFrameworkContract = contract))
  }

  private fun createEncodedTokenForUser(user: AuthUser): String {
    return tokenFactory.createEncodedToken(userID = user.id, userName = user.userName, authSource = user.authSource)
  }

  @Test
  fun `sp user works for prime provider and has all required contract groups`() {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_HARMONY_LIVING",
        "INT_CR_0001",
        "INT_CR_0002",
      )
    )

    listOf(
      setupAssistant.createDynamicFrameworkContract(
        contractReference = "0001",
        primeProviderId = "HARMONY_LIVING",
        subContractorServiceProviderIds = emptySet(),
      ),
      setupAssistant.createDynamicFrameworkContract(
        contractReference = "0002",
        primeProviderId = "HARMONY_LIVING",
        subContractorServiceProviderIds = emptySet(),
      )
    ).forEach {
      createSentReferral(it)
    }

    val token = createEncodedTokenForUser(user)
    val response = requestFactory.create(Request.GetSentReferrals, token).exchange()
    response.expectStatus().is2xxSuccessful
    response.expectBody().jsonPath("$.length()").isEqualTo(2)
  }

  @Test
  fun `sp user works for prime and subcontractor providers and has all required contract groups`() {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_HOME_TRUST",
        "INT_CR_0001",
        "INT_CR_0002",
      )
    )

    listOf(
      setupAssistant.createDynamicFrameworkContract(
        contractReference = "0001",
        primeProviderId = "HARMONY_LIVING",
        subContractorServiceProviderIds = setOf("HOME_TRUST"),
      ),
      setupAssistant.createDynamicFrameworkContract(
        contractReference = "0002",
        primeProviderId = "HOME_TRUST",
        subContractorServiceProviderIds = emptySet(),
      )
    ).forEach {
      createSentReferral(it)
    }

    val token = createEncodedTokenForUser(user)
    val response = requestFactory.create(Request.GetSentReferrals, token).exchange()
    response.expectStatus().is2xxSuccessful
    response.expectBody().jsonPath("$.length()").isEqualTo(2)
  }

  @Test
  fun `sp user works for prime provider but is missing a required contract group`() {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_HOME_TRUST",
        "INT_CR_0003",
      )
    )

    listOf(
      setupAssistant.createDynamicFrameworkContract(
        contractReference = "0001",
        primeProviderId = "HARMONY_LIVING",
        subContractorServiceProviderIds = setOf("HOME_TRUST"),
      ),
      setupAssistant.createDynamicFrameworkContract(
        contractReference = "0002",
        primeProviderId = "HOME_TRUST",
        subContractorServiceProviderIds = emptySet(),
      )
    ).forEach {
      createSentReferral(it)
    }

    // valid contract for the user - but no referrals
    setupAssistant.createDynamicFrameworkContract(
      contractReference = "0003",
      primeProviderId = "HOME_TRUST",
      subContractorServiceProviderIds = emptySet(),
    )

    val token = createEncodedTokenForUser(user)
    val response = requestFactory.create(Request.GetSentReferrals, token).exchange()
    response.expectStatus().is2xxSuccessful
    response.expectBody().jsonPath("$.length()").isEqualTo(0)
  }

  @Test
  fun `sp user has no valid provider or contract groups`() {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_HOME_TRUST",
        "INT_CR_0999",
      )
    )

    val token = createEncodedTokenForUser(user)
    val response = requestFactory.create(Request.GetSentReferrals, token).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "service provider id does not exist in the interventions database",
      "user has no valid contract groups configured"
      ]}
      """.trimIndent()
    )
  }

  @Test
  fun `pp user can only see referrals they sent`() {
    val user1 = setupAssistant.createPPUser("987623874568234")
    val user2 = setupAssistant.createPPUser("875234765234233")
    setupAssistant.createSentReferral(ppUser = user1)
    setupAssistant.createSentReferral(ppUser = user2)

    val token = createEncodedTokenForUser(user1)
    val response = requestFactory.create(Request.GetSentReferrals, token).exchange()
    response.expectStatus().is2xxSuccessful
    response.expectBody().jsonPath("$.length()").isEqualTo(1)
  }

  @Test
  fun `nomis users can't access sent referrals`() {
    setupAssistant.createSentReferral()
    val token = tokenFactory.createEncodedToken("123456", "nomis", "tom")

    val response = requestFactory.create(Request.GetSentReferrals, token).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "invalid user type"
      ]}
      """.trimIndent()
    )
  }

  @Test
  fun `users not found in hmpps auth can't access sent referrals'`() {
    val user = setupAssistant.createSPUser()
    setUserGroups(user, null)

    val referral = setupAssistant.createSentReferral()
    val token = createEncodedTokenForUser(user)

    val response = requestFactory.create(Request.GetSentReferrals, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "cannot find user in hmpps auth"
      ]}
      """.trimIndent()
    )
  }
}

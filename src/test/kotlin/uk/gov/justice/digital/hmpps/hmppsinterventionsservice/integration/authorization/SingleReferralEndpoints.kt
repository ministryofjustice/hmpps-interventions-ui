package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.authorization

import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.boot.test.mock.mockito.MockBean
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.IntegrationTestBase
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import java.util.UUID

class SingleReferralEndpoints : IntegrationTestBase() {
  @MockBean lateinit var mockHmppsAuthService: HMPPSAuthService

  private lateinit var requestFactory: RequestFactory

  private val tokenFactory = JwtTokenFactory()

  @BeforeEach
  fun initRequestBuilder() {
    requestFactory = RequestFactory(webTestClient, setupAssistant)
  }

  companion object {
    @JvmStatic private fun draftReferralRequests(): List<Request> {
      return listOf(Request.GetDraftReferral, Request.UpdateDraftReferral, Request.SendDraftReferral)
    }

    @JvmStatic private fun sentReferralRequests(): List<Request> {
      return listOf(Request.GetSentReferral, Request.AssignSentReferral, Request.EndSentReferral)
    }

    @JvmStatic private fun allReferralRequests(): List<Request> {
      return draftReferralRequests() + sentReferralRequests()
    }
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

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `sp user works for prime provider and has required contract group`(request: Request) {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_HARMONY_LIVING",
        "INT_CR_0001",
      )
    )

    val contract = setupAssistant.createDynamicFrameworkContract(
      contractReference = "0001",
      primeProviderId = "HARMONY_LIVING",
      subContractorServiceProviderIds = emptySet()
    )
    val referral = createSentReferral(contract)
    val token = createEncodedTokenForUser(user)

    requestFactory.create(request, token, referral.id.toString())
      .exchange()
      .expectStatus()
      .is2xxSuccessful
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `sp user works for subcontractor provider and has required contract group`(request: Request) {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_BETTER_LTD",
        "INT_CR_0001",
      )
    )

    val contract = setupAssistant.createDynamicFrameworkContract(
      contractReference = "0001",
      primeProviderId = "HARMONY_LIVING",
      subContractorServiceProviderIds = setOf("BETTER_LTD")
    )
    val referral = createSentReferral(contract)
    val token = createEncodedTokenForUser(user)

    requestFactory.create(request, token, referral.id.toString())
      .exchange()
      .expectStatus()
      .is2xxSuccessful
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `sp user works for a provider that does not exist and has a non existent contract group`(request: Request) {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_BETTER_LTD",
        "INT_CR_0002",
      )
    )

    val contract = setupAssistant.createDynamicFrameworkContract(
      contractReference = "0001",
      primeProviderId = "HARMONY_LIVING",
      subContractorServiceProviderIds = setOf()
    )
    val referral = createSentReferral(contract)
    val token = createEncodedTokenForUser(user)

    val response = requestFactory.create(request, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "service provider id 'BETTER_LTD' does not exist in the interventions database",
      "user has no valid contract groups configured"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `sp user works for the wrong provider and has wrong contract group`(request: Request) {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_BETTER_LTD",
        "INT_CR_0002",
      )
    )

    setupAssistant.createDynamicFrameworkContract(
      contractReference = "0002",
      primeProviderId = "BETTER_LTD",
      subContractorServiceProviderIds = setOf()
    )

    val contract = setupAssistant.createDynamicFrameworkContract(
      contractReference = "0001",
      primeProviderId = "HARMONY_LIVING",
      subContractorServiceProviderIds = setOf()
    )

    val referral = createSentReferral(contract)
    val token = createEncodedTokenForUser(user)

    val response = requestFactory.create(request, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "user's organization is not eligible to access this referral",
      "user does not have the required contract group to access this referral"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `sp user works for subcontractor provider but is missing required contract group`(request: Request) {
    val user = setupAssistant.createSPUser()

    setUserGroups(
      user,
      listOf(
        "INT_SP_BETTER_LTD",
        "INT_CR_0002",
      )
    )

    val contract = setupAssistant.createDynamicFrameworkContract(
      contractReference = "0001",
      primeProviderId = "HARMONY_LIVING",
      subContractorServiceProviderIds = setOf("BETTER_LTD")
    )
    val referral = createSentReferral(contract)
    val token = createEncodedTokenForUser(user)

    val response = requestFactory.create(request, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "user has no valid contract groups configured"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `sp user does not have any groups in hmpps auth`(request: Request) {
    val user = setupAssistant.createSPUser()
    setUserGroups(user, emptyList())

    val contract = setupAssistant.createDynamicFrameworkContract(
      contractReference = "0001",
      primeProviderId = "HARMONY_LIVING",
      subContractorServiceProviderIds = setOf("BETTER_LTD")
    )
    val referral = createSentReferral(contract)
    val token = createEncodedTokenForUser(user)

    val response = requestFactory.create(request, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "no service provider groups associated with user",
      "no contract groups associated with user"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `sp user has more than one service provider group in hmpps auth`(request: Request) {
    val user = setupAssistant.createSPUser()
    setUserGroups(
      user,
      listOf(
        "INT_SP_HARMONY_LIVING",
        "INT_SP_BETTER_LTD",
        "INT_CR_0001"
      )
    )

    val contract = setupAssistant.createDynamicFrameworkContract(
      contractReference = "0001",
      primeProviderId = "HARMONY_LIVING",
      subContractorServiceProviderIds = setOf("BETTER_LTD")
    )
    val referral = createSentReferral(contract)
    val token = createEncodedTokenForUser(user)

    val response = requestFactory.create(request, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "more than one service provider group associated with user"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("draftReferralRequests")
  fun `sp users can never access any draft referrals`(request: Request) {
    val user = setupAssistant.createSPUser()

    val referral = setupAssistant.createDraftReferral()
    val token = createEncodedTokenForUser(user)

    val response = requestFactory.create(request, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "only probation practitioners can access draft referrals"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `nomis users can never access anything`(request: Request) {
    val referral = setupAssistant.createSentReferral()
    val token = tokenFactory.createEncodedToken("123456", "nomis", "tom")

    val response = requestFactory.create(request, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "invalid user type"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("sentReferralRequests")
  fun `users not found in hmpps auth can never access anything`(request: Request) {
    val user = setupAssistant.createSPUser()
    setUserGroups(user, null)

    val referral = setupAssistant.createSentReferral()
    val token = createEncodedTokenForUser(user)

    val response = requestFactory.create(request, token, referral.id.toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "cannot find user in hmpps auth"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("allReferralRequests")
  fun `auth tokens with missing claims can never access anything`(request: Request) {
    val token = tokenFactory.createEncodedToken("123456", null, null)
    val response = requestFactory.create(request, token, UUID.randomUUID().toString()).exchange()
    response.expectStatus().isForbidden
    response.expectBody().json(
      """
      {"accessErrors": [
      "no 'auth_source' claim in token",
      "no 'user_name' claim in token"
      ]}
      """.trimIndent()
    )
  }

  @ParameterizedTest(name = "{displayName} ({argumentsWithNames})")
  @MethodSource("allReferralRequests")
  fun `requests with no auth token can never access anything`(request: Request) {
    val response = requestFactory.create(request, null, UUID.randomUUID().toString()).exchange()
    response.expectStatus().isUnauthorized
  }
}

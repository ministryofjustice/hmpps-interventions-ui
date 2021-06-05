package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.State
import au.com.dius.pact.provider.junitsupport.loader.PactBroker
import au.com.dius.pact.provider.spring.junit5.PactVerificationSpringProvider
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.IntegrationTestBase
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CommunityAPIOffenderService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CommunityAPIReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.RisksAndNeedsService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceUserAccessResult
import java.util.UUID

@PactBroker
@Provider("Interventions Service")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class PactTest : IntegrationTestBase() {
  @MockBean private lateinit var hmppsAuthService: HMPPSAuthService
  @MockBean private lateinit var communityAPIOffenderService: CommunityAPIOffenderService
  @MockBean private lateinit var communityAPIReferralService: CommunityAPIReferralService
  @MockBean private lateinit var risksAndNeedsService: RisksAndNeedsService

  @TestTemplate
  @ExtendWith(PactVerificationSpringProvider::class)
  fun pactVerificationTestTemplate(context: PactVerificationContext) {
    context.verifyInteraction()
  }

  @BeforeEach
  fun `before each`(context: PactVerificationContext) {
    // required for 'sendDraftReferral' to return a valid DTO
    whenever(risksAndNeedsService.createSupplementaryRisk(any(), any(), any(), anyOrNull(), any())).thenReturn(UUID.randomUUID())

    whenever(communityAPIOffenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(any(), any()))
      .thenReturn(ServiceUserAccessResult(true, emptyList()))

    context.addStateChangeHandlers(
      ActionPlanContracts(setupAssistant),
      InterventionContracts(setupAssistant),
      ReferralContracts(setupAssistant),
      ServiceCategoryContracts(setupAssistant),
      EndOfServiceReportContracts(setupAssistant),
    )
  }

  @State("nothing")
  fun `noop`() {}
}

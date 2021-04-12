package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.loader.PactBroker
import au.com.dius.pact.provider.spring.junit5.PactVerificationSpringProvider
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanAppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DynamicFrameworkContractRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.NPSRegionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceProviderRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService

@PactBroker
@Provider("Interventions Service")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("test", "local")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PactTest {
  @MockBean private lateinit var hmppsAuthService: HMPPSAuthService

  @Autowired private lateinit var referralRepository: ReferralRepository
  @Autowired private lateinit var actionPlanRepository: ActionPlanRepository
  @Autowired private lateinit var actionPlanAppointmentRepository: ActionPlanAppointmentRepository
  @Autowired private lateinit var authUserRepository: AuthUserRepository
  @Autowired private lateinit var interventionRepository: InterventionRepository
  @Autowired private lateinit var serviceCategoryRepository: ServiceCategoryRepository
  @Autowired private lateinit var serviceProviderRepository: ServiceProviderRepository
  @Autowired private lateinit var npsRegionRepository: NPSRegionRepository
  @Autowired private lateinit var dynamicFrameworkContractRepository: DynamicFrameworkContractRepository
  @Autowired private lateinit var desiredOutcomeRepository: DesiredOutcomeRepository

  @TestTemplate
  @ExtendWith(PactVerificationSpringProvider::class)
  fun pactVerificationTestTemplate(context: PactVerificationContext) {
    context.verifyInteraction()
  }

  @BeforeEach
  fun `before each`(context: PactVerificationContext) {
    val setupAssistant = SetupAssistant(
      authUserRepository,
      referralRepository,
      interventionRepository,
      actionPlanRepository,
      actionPlanAppointmentRepository,
      serviceCategoryRepository,
      serviceProviderRepository,
      npsRegionRepository,
      dynamicFrameworkContractRepository,
      desiredOutcomeRepository,
      hmppsAuthService,
    )

    setupAssistant.cleanAll()

    context.addStateChangeHandlers(
      ActionPlanContracts(setupAssistant),
      InterventionContracts(setupAssistant),
      ReferralContracts(setupAssistant),
      ServiceCategoryContracts(setupAssistant),
    )
  }
}

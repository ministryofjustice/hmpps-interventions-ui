package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration

import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.reactive.server.WebTestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DeliverySessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryAddressRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CancellationReasonRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CaseNoteRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ContractTypeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DynamicFrameworkContractRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.EndOfServiceReportRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.NPSRegionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceProviderRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.SupplierAssessmentRepository

@SpringBootTest(webEnvironment = RANDOM_PORT)
@ActiveProfiles("test", "local")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
abstract class IntegrationTestBase {

  @Suppress("SpringJavaInjectionPointsAutowiringInspection")
  @Autowired
  lateinit var webTestClient: WebTestClient

  @Autowired protected lateinit var referralRepository: ReferralRepository
  @Autowired protected lateinit var actionPlanRepository: ActionPlanRepository
  @Autowired protected lateinit var deliverySessionRepository: DeliverySessionRepository
  @Autowired protected lateinit var authUserRepository: AuthUserRepository
  @Autowired protected lateinit var interventionRepository: InterventionRepository
  @Autowired protected lateinit var serviceCategoryRepository: ServiceCategoryRepository
  @Autowired protected lateinit var serviceProviderRepository: ServiceProviderRepository
  @Autowired protected lateinit var npsRegionRepository: NPSRegionRepository
  @Autowired protected lateinit var dynamicFrameworkContractRepository: DynamicFrameworkContractRepository
  @Autowired protected lateinit var desiredOutcomeRepository: DesiredOutcomeRepository
  @Autowired protected lateinit var endOfServiceReportRepository: EndOfServiceReportRepository
  @Autowired protected lateinit var cancellationReasonRepository: CancellationReasonRepository
  @Autowired protected lateinit var contractTypeRepository: ContractTypeRepository
  @Autowired protected lateinit var appointmentRepository: AppointmentRepository
  @Autowired protected lateinit var supplierAssessmentRepository: SupplierAssessmentRepository
  @Autowired protected lateinit var appointmentDeliveryRepository: AppointmentDeliveryRepository
  @Autowired protected lateinit var appointmentDeliveryAddressRepository: AppointmentDeliveryAddressRepository
  @Autowired protected lateinit var caseNoteRepository: CaseNoteRepository
  protected lateinit var setupAssistant: SetupAssistant

  @BeforeEach
  fun setup() {
    setupAssistant = SetupAssistant(
      authUserRepository,
      referralRepository,
      interventionRepository,
      actionPlanRepository,
      deliverySessionRepository,
      serviceCategoryRepository,
      serviceProviderRepository,
      npsRegionRepository,
      dynamicFrameworkContractRepository,
      desiredOutcomeRepository,
      endOfServiceReportRepository,
      cancellationReasonRepository,
      contractTypeRepository,
      appointmentRepository,
      supplierAssessmentRepository,
      appointmentDeliveryRepository,
      appointmentDeliveryAddressRepository,
      caseNoteRepository
    )
    setupAssistant.cleanAll()
  }
}

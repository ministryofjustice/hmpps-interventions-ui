package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class DeliverySessionRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val actionPlanRepository: ActionPlanRepository,
  val deliverySessionRepository: DeliverySessionRepository,
  val interventionRepository: InterventionRepository,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
  val supplierAssessmentRepository: SupplierAssessmentRepository,
  val appointmentRepository: AppointmentRepository,
  val dynamicFrameworkContractRepository: DynamicFrameworkContractRepository,
) {
  private val authUserFactory = AuthUserFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)
  private val deliverySessionFactory = DeliverySessionFactory(entityManager)

  @BeforeEach
  fun setup() {
    deliverySessionRepository.deleteAll()
    supplierAssessmentRepository.deleteAll()
    appointmentRepository.deleteAll()
    actionPlanRepository.deleteAll()
    endOfServiceReportRepository.deleteAll()

    entityManager.flush()
    entityManager.clear()

    referralRepository.deleteAll()
    interventionRepository.deleteAll()
    dynamicFrameworkContractRepository.deleteAll()
    authUserRepository.deleteAll()
    entityManager.flush()
  }

  @Test
  fun `can retrieve an action plan session`() {
    val user = authUserFactory.create(id = "referral_repository_test_user_id")
    val referral = referralFactory.createDraft(createdBy = user)
    val deliverySession = deliverySessionFactory.createScheduled(referral = referral)

    entityManager.flush()
    entityManager.clear()

    val savedSession = deliverySessionRepository.findById(deliverySession.id).get()

    assertThat(savedSession.id).isEqualTo(deliverySession.id)
  }
}

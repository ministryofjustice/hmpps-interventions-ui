package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class ActionPlanAppointmentRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val actionPlanRepository: ActionPlanRepository,
  val actionPlanAppointmentRepository: ActionPlanAppointmentRepository,
  val interventionRepository: InterventionRepository,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
) {
  private val authUserFactory = AuthUserFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)
  private val actionPlanFactory = ActionPlanFactory(entityManager)

  @BeforeEach
  fun setup() {
    actionPlanAppointmentRepository.deleteAll()
    actionPlanRepository.deleteAll()
    referralRepository.deleteAll()
    interventionRepository.deleteAll()
    endOfServiceReportRepository.deleteAll()
    authUserRepository.deleteAll()
  }

  @Test
  fun `can retrieve an action plan appointment`() {
    val user = authUserFactory.create(id = "referral_repository_test_user_id")
    val referral = referralFactory.createDraft(createdBy = user)
    val actionPlan = actionPlanFactory.create(referral = referral)
    val actionPlanAppointment = buildAndPersistActionPlanAppointment(user, actionPlan)

    entityManager.flush()
    entityManager.clear()

    val savedAppointment = actionPlanAppointmentRepository.findById(actionPlanAppointment.id).get()

    assertThat(savedAppointment.id).isEqualTo(actionPlanAppointment.id)
  }

  private fun buildAndPersistReferral(user: AuthUser): Referral {

    val referral = SampleData.sampleReferral("X123456", "Harmony Living", createdBy = user)
    SampleData.persistReferral(entityManager, referral)

    return referral
  }

  private fun buildAndPersistActionPlan(user: AuthUser, referral: Referral): ActionPlan {

    val serviceCategory = SampleData.sampleServiceCategory()
    entityManager.persist(serviceCategory)

    val desiredOutcome = SampleData.sampleDesiredOutcome(description = "Removing Barriers", serviceCategoryId = serviceCategory.id)
    entityManager.persist(desiredOutcome)

    val actionPlan = SampleData.sampleActionPlan(referral = referral, desiredOutcome = desiredOutcome, createdBy = user)
    entityManager.persist(actionPlan)

    return actionPlan
  }

  private fun buildAndPersistActionPlanAppointment(user: AuthUser, actionPlan: ActionPlan): ActionPlanAppointment {

    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = user)
    actionPlanAppointmentRepository.save(actionPlanAppointment)

    return actionPlanAppointment
  }
}

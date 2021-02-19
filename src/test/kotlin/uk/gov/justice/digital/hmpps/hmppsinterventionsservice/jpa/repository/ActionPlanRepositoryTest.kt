package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class ActionPlanRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val actionPlanRepository: ActionPlanRepository,
) {
  private val authUserFactory = AuthUserFactory(entityManager)

  @Test
  fun `can retrieve an action plan`() {
    val actionPlan = buildAndPersistActionPlan()
    val actionPlanFirstActivity = actionPlan.activities.first()

    val savedPlan = actionPlanRepository.findById(actionPlan.id)

    assertThat(savedPlan.get().numberOfSessions).isEqualTo(actionPlan.numberOfSessions)
    assertThat(savedPlan.get().activities.size).isEqualTo(1)

    val savedPlanFirstActivity = savedPlan.get().activities.first()
    assertThat(actionPlanFirstActivity.desiredOutcome.id).isEqualTo(savedPlanFirstActivity.desiredOutcome.id)
    assertThat(actionPlanFirstActivity.description).isEqualTo(savedPlanFirstActivity.description)
  }

  private fun buildAndPersistActionPlan(): ActionPlan {
    val user = authUserFactory.create(id = "referral_repository_test_user_id")

    val referral = SampleData.sampleReferral("X123456", "Harmony Living", createdBy = user)
    SampleData.persistReferral(entityManager, referral)

    val serviceCategory = SampleData.sampleServiceCategory()
    entityManager.persist(serviceCategory)

    val desiredOutcome = SampleData.sampleDesiredOutcome(description = "Removing Barriers", serviceCategoryId = serviceCategory.id)
    entityManager.persist(desiredOutcome)

    val actionPlan = SampleData.sampleActionPlan(referral = referral, desiredOutcome = desiredOutcome, createdBy = user)
    actionPlanRepository.save(actionPlan)
    entityManager.flush()

    return actionPlan
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.service

import com.nhaarman.mockitokotlin2.mock
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.ActionPlanValidator
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.IntegrationTestBase
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanSessionsService

class ActionPlanServiceIntegrationTest @Autowired constructor(
  val actionPlanValidator: ActionPlanValidator,
) : IntegrationTestBase() {

  private lateinit var actionPlanService: ActionPlanService

  @BeforeEach
  fun beforeEach() {
    actionPlanService = ActionPlanService(
      authUserRepository,
      referralRepository,
      actionPlanRepository,
      this.actionPlanValidator,
      mock<ActionPlanEventPublisher>(),
      mock<ActionPlanSessionsService>(),
    )
  }

  @Test
  fun `can store multiple action plans on a referral and their creation order is preserved`() {
    val referral = setupAssistant.createAssignedReferral()
    assertThat(referral.currentActionPlan).isNull()

    val firstActionPlan = actionPlanService.createDraftActionPlan(referral.id, null, listOf(), referral.assignedTo!!)
    actionPlanService.createDraftActionPlan(referral.id, 4, listOf(), referral.assignedTo!!)
    val lastActionPlan = actionPlanService.createDraftActionPlan(referral.id, 10, listOf(), referral.assignedTo!!)

    // need JPA to reload the referral so it picks up the foreign key associations created above
    val updatedReferral = referralRepository.findByIdOrNull(referral.id)!!

    assertThat(updatedReferral.actionPlans?.size).isEqualTo(3)

    assertThat(updatedReferral.actionPlans?.first()).isEqualTo(firstActionPlan)
    assertThat(updatedReferral.actionPlans?.last()).isEqualTo(lastActionPlan)

    assertThat(updatedReferral.currentActionPlan).isEqualTo(lastActionPlan)
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.ActionPlanValidator
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityNotFoundException

internal class ActionPlanServiceTest {

  private val authUserRepository: AuthUserRepository = mock()
  private val referralRepository: ReferralRepository = mock()
  private val actionPlanRepository: ActionPlanRepository = mock()
  private val actionPlanValidator: ActionPlanValidator = mock()
  private val actionPlanEventPublisher: ActionPlanEventPublisher = mock()

  private val actionPlanService = ActionPlanService(authUserRepository, referralRepository, actionPlanRepository, actionPlanValidator, actionPlanEventPublisher)

  @Test
  fun `builds and saves an action plan for a referral`() {
    val referralId = UUID.randomUUID()
    val numberOfSessions = 5
    val authUser = AuthUser("CRN123", "auth", "user")
    val desiredOutcome = DesiredOutcome(UUID.randomUUID(), "outcome", UUID.randomUUID())
    val activities = listOf(ActionPlanActivity("description", OffsetDateTime.now(), desiredOutcome))
    val referral = SampleData.sampleReferral("CRN123", "Service Provider")

    whenever(authUserRepository.save(authUser)).thenReturn(authUser)
    whenever(referralRepository.getOne(referralId)).thenReturn(referral)
    whenever(
      actionPlanRepository.save(
        ArgumentMatchers.argThat { (
          numberOfSessionsArg,
          activitiesArg,
          createdByArg,
          _,
          submittedByArg,
          submittedAtArg,
          referralArg,
          _
        ) ->
          (
            numberOfSessionsArg == numberOfSessions &&
              activitiesArg.size == activities.size &&
              activitiesArg.first() == activities.first() &&
              createdByArg == authUser &&
              submittedAtArg == null &&
              submittedByArg == null &&
              referralArg.equals(referral)
            )
        }
      )
    ).thenReturn(SampleData.sampleActionPlan())

    val draftActionPlan = actionPlanService.createDraftActionPlan(referralId, numberOfSessions, activities, authUser)

    assertThat(draftActionPlan).isNotNull
  }

  @Test
  fun `gets action plan using action plan id`() {
    val actionPlanId = UUID.randomUUID()
    val draftActionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(actionPlanId)).thenReturn(draftActionPlan)

    val draftActionPlanResponse = actionPlanService.getDraftActionPlan(actionPlanId)

    assertThat(draftActionPlanResponse).isSameAs(draftActionPlan)
  }

  @Test
  fun `get action plan using action plan id not found`() {
    val actionPlanId = UUID.randomUUID()
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(actionPlanId)).thenReturn(null)

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      actionPlanService.getDraftActionPlan(actionPlanId)
    }
    assertThat(exception.message).isEqualTo("draft action plan not found [id=$actionPlanId]")
  }

  @Test
  fun `successful update action plan`() {
    val draftActionPlanId = UUID.randomUUID()
    val draftActionPlan = SampleData.sampleActionPlan(id = draftActionPlanId)
    val draftActionPlanUpdate = SampleData.sampleActionPlan(id = draftActionPlanId, numberOfSessions = 5)

    val updatedActionPlan = draftActionPlan.copy()
    updatedActionPlan.numberOfSessions = 5

    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(draftActionPlanId)).thenReturn(draftActionPlan)
    whenever(actionPlanRepository.save(any())).thenReturn(updatedActionPlan)

    val updatedDraftActionPlanResponse = actionPlanService.updateActionPlan(draftActionPlanUpdate)

    assertThat(updatedDraftActionPlanResponse).isSameAs(updatedActionPlan)
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
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
import java.util.Optional.empty
import java.util.Optional.of
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
          _,
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
  fun `successful update action plan with number of sessions`() {
    val draftActionPlanId = UUID.randomUUID()
    val draftActionPlan = SampleData.sampleActionPlan(id = draftActionPlanId, numberOfSessions = 9)
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(draftActionPlanId)).thenReturn(draftActionPlan)

    val updatedDraftActionPlan = draftActionPlan.copy(numberOfSessions = 5)
    whenever(
      actionPlanRepository.save(
        ArgumentMatchers.argThat {
          (
            numberOfSessionsArg, activitiesArg, _, _, _, _, _, _
          ) ->
          (
            numberOfSessionsArg == 5 && activitiesArg.size == draftActionPlan.activities.size
            )
        }
      )
    ).thenReturn(updatedDraftActionPlan)

    val updatedDraftActionPlanResponse = actionPlanService.updateActionPlan(draftActionPlanId, 5, null)

    assertThat(updatedDraftActionPlanResponse).isSameAs(updatedDraftActionPlan)
    assertThat(updatedDraftActionPlanResponse.numberOfSessions).isEqualTo(5)
    verify(actionPlanValidator).validateDraftActionPlanUpdate(any())
  }

  @Test
  fun `successful update action plan with new activity`() {
    val draftActionPlanId = UUID.randomUUID()
    val draftActionPlan = SampleData.sampleActionPlan(id = draftActionPlanId, numberOfSessions = 9, activities = listOf())
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(draftActionPlanId)).thenReturn(draftActionPlan)

    val updatedDraftActionPlan = draftActionPlan.copy()

    whenever(
      actionPlanRepository.save(
        ArgumentMatchers.argThat {
          (
            numberOfSessionsArg, activitiesArg, _, _, _, _, _, _
          ) ->
          (
            numberOfSessionsArg == 9 && activitiesArg.size == 1
            )
        }
      )
    ).thenReturn(updatedDraftActionPlan)

    val desiredOutcome = DesiredOutcome(UUID.randomUUID(), "Des Out", UUID.randomUUID())
    val newActivity = ActionPlanActivity("Description", OffsetDateTime.now(), desiredOutcome)

    val updatedDraftActionPlanResponse = actionPlanService.updateActionPlan(draftActionPlanId, null, newActivity)

    assertThat(updatedDraftActionPlanResponse).isSameAs(updatedDraftActionPlan)
    assertThat(updatedDraftActionPlanResponse.numberOfSessions).isEqualTo(9)
    assertThat(updatedDraftActionPlanResponse.activities).contains(newActivity)
  }

  @Test
  fun `get action plan using id`() {
    val actionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    whenever(actionPlanRepository.findById(actionPlanId)).thenReturn(of(actionPlan))

    assertThat(actionPlanService.getActionPlan(actionPlanId)).isSameAs(actionPlan)
  }

  @Test
  fun `get action plan throws exception when not found`() {
    val actionPlanId = UUID.randomUUID()
    whenever(actionPlanRepository.findById(actionPlanId)).thenReturn(empty())

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      actionPlanService.getActionPlan(actionPlanId)
    }
    assertThat(exception.message).isEqualTo("action plan not found [id=$actionPlanId]")
  }

  @Test
  fun `submit action plan`() {
    val timeBeforeSubmit = OffsetDateTime.now()
    val actionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    val authUser = AuthUser("CRN123", "auth", "user")
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(actionPlanId)).thenReturn(actionPlan)
    whenever(
      actionPlanRepository.save(
        ArgumentMatchers.argThat { (
          numberOfSessionsArg,
          activitiesArg,
          createdByArg,
          createdAtArg,
          submittedByArg,
          submittedAtArg,
          appointmentsArg,
          referralArg,
          idArg,
        ) ->
          (
            numberOfSessionsArg == actionPlan.numberOfSessions &&
              activitiesArg.size == actionPlan.activities.size &&
              activitiesArg.first() == actionPlan.activities.first() &&
              createdByArg == actionPlan.createdBy &&
              createdAtArg == actionPlan.createdAt &&
              submittedAtArg!!.isAfter(timeBeforeSubmit) &&
              submittedByArg!! == authUser &&
              appointmentsArg.isEmpty() &&
              referralArg == actionPlan.referral &&
              idArg == actionPlanId
            )
        }
      )
    ).thenReturn(SampleData.sampleActionPlan())

    val submittedActionPlan = actionPlanService.submitDraftActionPlan(actionPlanId, authUser)

    assertThat(submittedActionPlan).isNotNull
    verify(actionPlanValidator).validateSubmittedActionPlan(any())
  }

  @Test
  fun `submit action plan throws exception if draft plan is not used`() {
    val actionPlanId = UUID.randomUUID()
    val authUser = AuthUser("CRN123", "auth", "user")
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(actionPlanId)).thenReturn(null)

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      actionPlanService.submitDraftActionPlan(actionPlanId, authUser)
    }
    assertThat(exception.message).isEqualTo("draft action plan not found [id=$actionPlanId]")
  }

  @Test
  fun `get action plan using referral id`() {
    val actionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    whenever(actionPlanRepository.findByReferralId(actionPlan.referral.id)).thenReturn(actionPlan)

    assertThat(actionPlanService.getActionPlanByReferral(actionPlan.referral.id)).isSameAs(actionPlan)
  }

  @Test
  fun `get action plan using referral id throws exception when not found`() {
    val referralId = UUID.randomUUID()
    whenever(actionPlanRepository.findByReferralId(referralId)).thenReturn(null)

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      actionPlanService.getActionPlanByReferral(referralId)
    }
    assertThat(exception.message).isEqualTo("action plan not found [referralId=$referralId]")
  }
}

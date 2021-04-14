package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.ActionPlanValidator
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.EntityNotFoundException

@Service
class ActionPlanService(
  val authUserRepository: AuthUserRepository,
  val referralRepository: ReferralRepository,
  val actionPlanRepository: ActionPlanRepository,
  val actionPlanValidator: ActionPlanValidator,
  val actionPlanEventPublisher: ActionPlanEventPublisher,
  val appointmentsService: AppointmentsService,
  val desiredOutcomeRepository: DesiredOutcomeRepository,
) {

  fun createDraftActionPlan(
    referralId: UUID,
    numberOfSessions: Int?,
    activities: List<ActionPlanActivity>,
    createdByUser: AuthUser
  ): ActionPlan {

    val draftActionPlan = ActionPlan(
      id = randomUUID(),
      numberOfSessions = numberOfSessions,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now(),
      referral = referralRepository.getOne(referralId),
      activities = activities.toMutableList()
    )

    return actionPlanRepository.save(draftActionPlan)
  }

  fun getDraftActionPlan(id: UUID): ActionPlan {
    return actionPlanRepository.findByIdAndSubmittedAtIsNull(id)
      ?: throw EntityNotFoundException("draft action plan not found [id=$id]")
  }

  fun updateActionPlan(
    actionPlanId: UUID,
    numberOfSessions: Int?,
    newActivity: ActionPlanActivity?,
  ): ActionPlan {
    val draftActionPlan = getDraftActionPlan(actionPlanId)
    updateDraftActivityPlan(draftActionPlan, numberOfSessions, newActivity)
    actionPlanValidator.validateDraftActionPlanUpdate(draftActionPlan)

    return actionPlanRepository.save(draftActionPlan)
  }

  fun updateActionPlanActivity(actionPlanId: UUID, activityId: UUID, description: String?, desiredOutcomeId: UUID?): ActionPlan {
    val actionPlan = getActionPlan(actionPlanId)
    actionPlan.activities.forEach { x ->
      if (x.id == activityId) {
        description?.let { x.description = description }
        desiredOutcomeId?.let { x.desiredOutcome = getDesiredOutcomeByIdOrElseThrowException(it) }
      }
    }
    return actionPlanRepository.save(actionPlan)
  }

  fun submitDraftActionPlan(id: UUID, submittedByUser: AuthUser): ActionPlan {
    val draftActionPlan = getDraftActionPlanOrElseThrowException(id)
    val submittedActionPlan = updateDraftActionPlanAsSubmitted(draftActionPlan, submittedByUser)
    actionPlanValidator.validateSubmittedActionPlan(submittedActionPlan)

    appointmentsService.createUnscheduledAppointmentsForActionPlan(submittedActionPlan, submittedByUser)

    val savedSubmittedActionPlan = actionPlanRepository.save(submittedActionPlan)
    actionPlanEventPublisher.actionPlanSubmitEvent(savedSubmittedActionPlan)

    return savedSubmittedActionPlan
  }

  fun getActionPlan(id: UUID): ActionPlan {
    return actionPlanRepository.findById(id).orElseThrow {
      throw EntityNotFoundException("action plan not found [id=$id]")
    }
  }

  fun getActionPlanByReferral(referralId: UUID): ActionPlan {
    return actionPlanRepository.findByReferralId(referralId)
      ?: throw EntityNotFoundException("action plan not found [referralId=$referralId]")
  }

  private fun updateDraftActivityPlan(
    draftActionPlan: ActionPlan,
    numberOfSessions: Int?,
    newActivity: ActionPlanActivity?
  ) {
    numberOfSessions?.let {
      draftActionPlan.numberOfSessions = it
    }

    newActivity?.let {
      draftActionPlan.activities.add(it)
    }
  }

  private fun getDraftActionPlanOrElseThrowException(id: UUID): ActionPlan {
    return actionPlanRepository.findByIdAndSubmittedAtIsNull(id)
      ?: throw EntityNotFoundException("draft action plan not found [id=$id]")
  }

  private fun updateDraftActionPlanAsSubmitted(draftActionPlan: ActionPlan, submittedByUser: AuthUser): ActionPlan {
    draftActionPlan.submittedAt = OffsetDateTime.now()
    draftActionPlan.submittedBy = authUserRepository.save(submittedByUser)
    return draftActionPlan
  }

  private fun getDesiredOutcomeByIdOrElseThrowException(id: UUID): DesiredOutcome {
    return desiredOutcomeRepository.findById(id).orElseThrow {
      throw EntityNotFoundException("desired outcome not found [id=$id]")
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.ActionPlanValidator
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.EntityNotFoundException
import javax.transaction.Transactional

@Service
@Transactional
class ActionPlanService(
  val authUserRepository: AuthUserRepository,
  val referralRepository: ReferralRepository,
  val actionPlanRepository: ActionPlanRepository,
  val actionPlanValidator: ActionPlanValidator,
  val actionPlanEventPublisher: ActionPlanEventPublisher,
  val actionPlanSessionsService: ActionPlanSessionsService,
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

  fun updateActionPlanActivity(actionPlanId: UUID, activityId: UUID, description: String?): ActionPlan {
    val actionPlan = getActionPlan(actionPlanId)
    actionPlan.activities.forEach { activity ->
      if (activity.id == activityId) {
        description?.let { activity.description = description }
      }
    }
    return actionPlanRepository.save(actionPlan)
  }

  fun submitDraftActionPlan(id: UUID, submittedByUser: AuthUser): ActionPlan {
    val draftActionPlan = getDraftActionPlanOrElseThrowException(id)
    val submittedActionPlan = updateDraftActionPlanAsSubmitted(draftActionPlan, submittedByUser)
    actionPlanValidator.validateSubmittedActionPlan(submittedActionPlan)

    val savedSubmittedActionPlan = actionPlanRepository.save(submittedActionPlan)
    actionPlanEventPublisher.actionPlanSubmitEvent(savedSubmittedActionPlan)

    return savedSubmittedActionPlan
  }

  fun approveActionPlan(id: UUID, user: AuthUser): ActionPlan {
    val actionPlan = getActionPlan(id)
    actionPlan.approvedAt = OffsetDateTime.now()
    actionPlan.approvedBy = authUserRepository.save(user)

    actionPlanSessionsService.createUnscheduledSessionsForActionPlan(actionPlan)
    val approvedActionPlan = actionPlanRepository.save(actionPlan)
    actionPlanEventPublisher.actionPlanSubmitEvent(approvedActionPlan)
    return approvedActionPlan
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

  fun checkActionPlanExistsForReferral(referralId: UUID): Boolean {
    return actionPlanRepository.existsByReferralId(referralId)
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
}

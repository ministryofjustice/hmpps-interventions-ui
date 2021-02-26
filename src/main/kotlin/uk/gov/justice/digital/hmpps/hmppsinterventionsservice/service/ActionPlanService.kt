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

@Service
class ActionPlanService(
  val authUserRepository: AuthUserRepository,
  val referralRepository: ReferralRepository,
  val actionPlanRepository: ActionPlanRepository,
  val actionPlanValidator: ActionPlanValidator,
  val actionPlanEventPublisher: ActionPlanEventPublisher
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
      activities = activities
    )

    return actionPlanRepository.save(draftActionPlan)
  }

  fun getDraftActionPlan(id: UUID): ActionPlan {
    return actionPlanRepository.findByIdAndSubmittedAtIsNull(id)
      ?: throw EntityNotFoundException("draft action plan not found [id=$id]")
  }

  fun updateActionPlan(update: ActionPlan): ActionPlan {
    val draftActionPlan = getDraftActionPlan(update.id)
    actionPlanValidator.validateDraftActionPlanUpdate(update)
    updateDraftActivityPlan(draftActionPlan, update)

    return actionPlanRepository.save(draftActionPlan)
  }

  fun submitDraftActionPlan(id: UUID, submittedByUser: AuthUser): ActionPlan {

    val draftActionPlan = getDraftActionPlanAndThrowExceptionIfNotFound(id)
    submitActionPlan(draftActionPlan, submittedByUser)
    val savedDraftActionPlan = actionPlanRepository.save(draftActionPlan)
    actionPlanEventPublisher.actionPlanSubmitEvent(savedDraftActionPlan)

    return savedDraftActionPlan
  }

  fun getActionPlan(id: UUID): ActionPlan {
    return actionPlanRepository.findById(id).orElseThrow {
      throw EntityNotFoundException("action plan not found [id=$id]")
    }
  }

  private fun updateDraftActivityPlan(draftActionPlan: ActionPlan, update: ActionPlan) {
    update.numberOfSessions?.let {
      draftActionPlan.numberOfSessions = it
    }
  }

  private fun getDraftActionPlanAndThrowExceptionIfNotFound(id: UUID): ActionPlan {
    val draftActionPlan = actionPlanRepository.findByIdAndSubmittedAtIsNull(id)
      ?: throw EntityNotFoundException("draft action plan not found [id=$id]")
    return draftActionPlan
  }

  private fun submitActionPlan(draftActionPlan: ActionPlan, submittedByUser: AuthUser) {
    draftActionPlan.submittedAt = OffsetDateTime.now()
    draftActionPlan.submittedBy = submittedByUser
  }
}

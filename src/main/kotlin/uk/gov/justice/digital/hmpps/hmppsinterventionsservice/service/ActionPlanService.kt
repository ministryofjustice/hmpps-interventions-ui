package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.UUID
import java.util.UUID.randomUUID

@Service
class ActionPlanService(
  val authUserRepository: AuthUserRepository,
  val referralRepository: ReferralRepository,
  val actionPlanRepository: ActionPlanRepository
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

  fun getDraftActionPlan(id: UUID): ActionPlan? {
    return actionPlanRepository.findByIdAndSubmittedAtIsNull(id)
  }

  fun updateActionPlan(actionPlan: ActionPlan, update: DraftActionPlanDTO): ActionPlan {
    validateDraftActionPlanUpdate(update)

    update.numberOfSessions?.let {
      actionPlan.numberOfSessions = it
    }
    return actionPlanRepository.save(actionPlan)
  }

  private fun validateDraftActionPlanUpdate(update: DraftActionPlanDTO) {
    val errors = mutableListOf<FieldError>()

    update.numberOfSessions?.let {
      if (it <= 0) {
        errors.add(FieldError(field = "numberOfSessions", error = Code.CANNOT_BE_NEGATIVE_OR_ZERO))
      }
    } ?: errors.add(FieldError(field = "numberOfSessions", error = Code.CONDITIONAL_FIELD_MUST_BE_SET))

    if (errors.isNotEmpty()) {
      throw ValidationError("draft action plan update invalid", errors)
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code.CANNOT_BE_EMPTY
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code.CANNOT_BE_NEGATIVE_OR_ZERO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code.CANNOT_BE_REDUCED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan

@Component
class ActionPlanValidator {
  fun validateDraftActionPlanUpdate(update: ActionPlan) {
    val errors = mutableListOf<FieldError>()

    validateNumberOfSessionsIsGreaterThanZero(update, errors)

    if (errors.isEmpty()) {
      validateNumberOfSessionsIsNotReduced(update, errors)
    }

    if (errors.isNotEmpty()) {
      throw ValidationError("draft action plan update invalid", errors)
    }
  }

  fun validateSubmittedActionPlan(update: ActionPlan) {
    val errors = mutableListOf<FieldError>()

    validateNumberOfSessionsIsSpecified(update, errors)

    if (errors.isNotEmpty()) {
      throw ValidationError("submitted action plan invalid", errors)
    }
  }

  private fun validateNumberOfSessionsIsNotReduced(update: ActionPlan, errors: MutableList<FieldError>) {
    update.numberOfSessions?.let { requiredNumberOfSessions ->
      update.referral.approvedActionPlan?.let { latestApprovedPlan ->
        if (requiredNumberOfSessions < latestApprovedPlan.numberOfSessions!!) {
          errors.add(FieldError(field = "numberOfSessions", error = CANNOT_BE_REDUCED))
        }
      }
    }
  }

  private fun validateNumberOfSessionsIsGreaterThanZero(update: ActionPlan, errors: MutableList<FieldError>) {
    update.numberOfSessions?.let {
      if (it <= 0) {
        errors.add(FieldError(field = "numberOfSessions", error = CANNOT_BE_NEGATIVE_OR_ZERO))
      }
    }
  }

  private fun validateNumberOfSessionsIsSpecified(update: ActionPlan, errors: MutableList<FieldError>) {
    update.numberOfSessions?.let {
    } ?: errors.add(FieldError(field = "numberOfSessions", error = CANNOT_BE_EMPTY))
  }
}

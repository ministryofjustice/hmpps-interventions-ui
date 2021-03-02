package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan

@Component
class ActionPlanValidator {
  fun validateDraftActionPlanUpdate(update: ActionPlan) {
    val errors = mutableListOf<FieldError>()

    update.numberOfSessions?.let {
      if (it <= 0) {
        errors.add(FieldError(field = "numberOfSessions", error = Code.CANNOT_BE_NEGATIVE_OR_ZERO))
      }
    }

    if (errors.isNotEmpty()) {
      throw ValidationError("draft action plan update invalid", errors)
    }
  }
}

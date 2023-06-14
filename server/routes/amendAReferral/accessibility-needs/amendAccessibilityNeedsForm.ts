import { Request } from 'express'
import { ValidationChain, body, Result, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { FormData } from '../../../utils/forms/formData'
import { AmendReferralDetailsUpdate } from '../../../models/referralAccessibilityNeeds'

export default class AmendAccessibilityNeedsForm {
  static readonly amendAccessibilityNeedsReasonForChangeId = 'reason-for-change'

  static readonly accessibilityNeeds = 'accessibility-needs'

  constructor(private readonly request: Request) {}

  static get validations(): ValidationChain[] {
    return [
      body(AmendAccessibilityNeedsForm.amendAccessibilityNeedsReasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
      body(AmendAccessibilityNeedsForm.accessibilityNeeds)
        .custom((value, { req }) => {
          const updated = value
          const original = req.body?.origOutcomes
          return original !== updated
        })
        .withMessage(errorMessages.accessibilityneeds.noChanges),
    ]
  }

  get isValid(): boolean {
    return this.error == null
  }

  async data(): Promise<FormData<Partial<AmendReferralDetailsUpdate>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendAccessibilityNeedsForm.validations,
    })

    const noChangesMade = this.checkForNoChangesError(validationResult)
    if (noChangesMade) {
      return {
        paramsForUpdate: {
          changesMade: false,
        },
        error: null,
      }
    }

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {
        accessibilityNeeds: this.request.body[AmendAccessibilityNeedsForm.accessibilityNeeds],
        reasonForChange: this.request.body[AmendAccessibilityNeedsForm.amendAccessibilityNeedsReasonForChangeId],
        changesMade: true,
      },
      error: null,
    }
  }

  private error(validationResult: Result<ValidationError>): FormValidationError | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return FormUtils.getFormValidationError(validationResult)
  }

  private checkForNoChangesError(validationResult: Result<ValidationError>): boolean | null {
    if (validationResult.isEmpty()) {
      return null
    }
    return validationResult.array().some(validationError => {
      return validationError.msg === errorMessages.accessibilityneeds.noChanges
    })
  }
}

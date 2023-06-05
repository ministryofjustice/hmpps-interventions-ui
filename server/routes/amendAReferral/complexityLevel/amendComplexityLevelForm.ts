import { Request } from 'express'
import { ValidationChain, body, Result, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { FormData } from '../../../utils/forms/formData'
import { AmendReferralDetailsUpdate } from '../../../models/referralComplexityLevel'

export default class AmendComplexityLevelForm {
  static readonly amendComplexityReasonForChangeId = 'reason-for-change'

  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AmendReferralDetailsUpdate>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendComplexityLevelForm.validations,
    })

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {
        complexityLevelId: this.request.body['complexity-level-id'],
        reasonForChange: this.request.body[AmendComplexityLevelForm.amendComplexityReasonForChangeId],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('complexity-level-id').notEmpty().withMessage(errorMessages.complexityLevel.empty),
      body(AmendComplexityLevelForm.amendComplexityReasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
    ]
  }

  private error(validationResult: Result<ValidationError>): FormValidationError | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return FormUtils.getFormValidationError(validationResult)
  }
}

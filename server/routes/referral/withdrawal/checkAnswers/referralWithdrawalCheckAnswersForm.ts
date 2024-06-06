import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../../utils/errorMessages'
import { FormData } from '../../../../utils/forms/formData'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class ReferralWithdrawalCheckAnswersForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<NonNullable<unknown>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: this.validations(),
    })

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {},
      error: null,
    }
  }

  validations(): ValidationChain[] {
    return [
      body('confirm-withdrawal')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.withdrawReferral.withdrawalReason.empty),
    ]
  }

  private error(validationResult: Result<ValidationError>): FormValidationError | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return {
      errors: validationResult.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }
}

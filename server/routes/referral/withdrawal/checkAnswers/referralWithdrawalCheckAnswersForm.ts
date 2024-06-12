import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../../utils/errorMessages'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class ReferralWithdrawalCheckAnswersForm {
  constructor(private readonly request: Request) {}

  async validate(): Promise<FormValidationError | null> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: this.validations(),
    })

    return this.error(validationResult)
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

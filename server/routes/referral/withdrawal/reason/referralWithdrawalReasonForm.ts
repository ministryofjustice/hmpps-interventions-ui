import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../../utils/errorMessages'
import { FormData } from '../../../../utils/forms/formData'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class ReferralWithdrawalReasonForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<{ withdrawalReason: string; withdrawalComments: string }>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: ReferralWithdrawalReasonForm.validations,
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
        withdrawalReason: this.request.body['withdrawal-reason'],
        withdrawalComments: this.request.body['withdrawal-comments'],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [body('withdrawal-reason').notEmpty().withMessage(errorMessages.withdrawReferral.withdrawalReason.empty)]
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

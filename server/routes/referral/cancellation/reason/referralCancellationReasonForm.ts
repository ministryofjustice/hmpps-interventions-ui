import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../../utils/errorMessages'
import { FormData } from '../../../../utils/forms/formData'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class ReferralCancellationReasonForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<{ cancellationReason: string; cancellationComments: string }>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: ReferralCancellationReasonForm.validations,
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
        cancellationReason: this.request.body['cancellation-reason'],
        cancellationComments: this.request.body['cancellation-comments'],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [body('cancellation-reason').notEmpty().withMessage(errorMessages.cancelReferral.cancellationReason.empty)]
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

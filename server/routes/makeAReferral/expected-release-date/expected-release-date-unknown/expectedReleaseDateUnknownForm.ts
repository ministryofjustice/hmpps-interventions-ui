import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../../models/draftReferral'
import errorMessages from '../../../../utils/errorMessages'
import { FormData } from '../../../../utils/forms/formData'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'
import { FormValidationResult } from '../../../../utils/forms/formValidationResult'

export default class ExpectedReleaseDateUnknownForm {
  constructor(private readonly request: Request) {}

  static readonly releaseDateUnknownReason = 'release-date-unknown-reason'

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const validationResult = await ExpectedReleaseDateUnknownForm.validate(this.request)

    return validationResult.error
      ? {
          paramsForUpdate: null,
          error: {
            errors: validationResult!.error ? [...(validationResult!.error?.errors ?? [])] : [],
          },
        }
      : {
          paramsForUpdate: {
            expectedReleaseDateMissingReason: this.request.body['release-date-unknown-reason'],
          },
          error: null,
        }
  }

  static get validations(): ValidationChain[] {
    return [body('release-date-unknown-reason').notEmpty().withMessage(errorMessages.releaseDateUnknownReason.empty)]
  }

  static async validate(request: Request): Promise<FormValidationResult<DraftReferral>> {
    const validationResult = await FormUtils.runValidations({
      request,
      validations: ExpectedReleaseDateUnknownForm.validations,
    })

    const error = ExpectedReleaseDateUnknownForm.error(validationResult)
    if (error) {
      return { value: null, error }
    }
    return {
      value: request.body[ExpectedReleaseDateUnknownForm.releaseDateUnknownReason],
      error: null,
    }
  }

  public static error(validationResult: Result<ValidationError>): FormValidationError | null {
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

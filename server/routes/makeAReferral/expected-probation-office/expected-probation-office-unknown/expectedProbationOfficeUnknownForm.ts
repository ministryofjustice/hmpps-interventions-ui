import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../../models/draftReferral'
import errorMessages from '../../../../utils/errorMessages'
import { FormData } from '../../../../utils/forms/formData'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'
import { FormValidationResult } from '../../../../utils/forms/formValidationResult'

export default class ExpectedProbationOfficeUnknownForm {
  constructor(private readonly request: Request) {}

  static readonly probationOfficeUnknownReason = 'probation-office-unknown-reason'

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const validationResult = await ExpectedProbationOfficeUnknownForm.validate(this.request)

    return validationResult.error
      ? {
          paramsForUpdate: null,
          error: {
            errors: validationResult!.error ? [...(validationResult!.error?.errors ?? [])] : [],
          },
        }
      : {
          paramsForUpdate: {
            expectedProbationOfficeUnKnownReason: this.request.body['probation-office-unknown-reason'],
          },
          error: null,
        }
  }

  static get validations(): ValidationChain[] {
    return [
      body('probation-office-unknown-reason').notEmpty().withMessage(errorMessages.probationOfficeUnknownReason.empty),
    ]
  }

  static async validate(request: Request): Promise<FormValidationResult<DraftReferral>> {
    const validationResult = await FormUtils.runValidations({
      request,
      validations: ExpectedProbationOfficeUnknownForm.validations,
    })

    const error = ExpectedProbationOfficeUnknownForm.error(validationResult)
    if (error) {
      return { value: null, error }
    }
    return {
      value: request.body[ExpectedProbationOfficeUnknownForm.probationOfficeUnknownReason],
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

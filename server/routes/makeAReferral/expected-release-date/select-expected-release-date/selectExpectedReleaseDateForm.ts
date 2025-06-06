import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../../models/draftReferral'
import errorMessages from '../../../../utils/errorMessages'
import { FormData } from '../../../../utils/forms/formData'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'
import { FormValidationResult } from '../../../../utils/forms/formValidationResult'

export default class SelectExpectedReleaseDateForm {
  constructor(
    private readonly request: Request,
    private readonly releaseDate: string | null
  ) {}

  static readonly releaseDateUnknownReason = 'release-date-unknown-reason'

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const validationResult = await SelectExpectedReleaseDateForm.validate(this.request)

    if (validationResult.error) {
      return {
        paramsForUpdate: null,
        error: {
          errors: validationResult!.error ? [...(validationResult!.error?.errors ?? [])] : [],
        },
      }
    }
    if (this.request.body?.['expected-release-date'] === 'confirm') {
      return {
        paramsForUpdate: {
          hasExpectedReleaseDate: true,
          expectedReleaseDate: this.releaseDate,
        },
        error: null,
      }
    }
    return {
      paramsForUpdate: {},
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [body('expected-release-date').notEmpty().withMessage(errorMessages.expectedReleaseDate.empty)]
  }

  static async validate(request: Request): Promise<FormValidationResult<DraftReferral>> {
    const validationResult = await FormUtils.runValidations({
      request,
      validations: SelectExpectedReleaseDateForm.validations,
    })

    const error = SelectExpectedReleaseDateForm.error(validationResult)
    if (error) {
      return { value: null, error }
    }
    return {
      value: request.body[SelectExpectedReleaseDateForm.releaseDateUnknownReason],
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

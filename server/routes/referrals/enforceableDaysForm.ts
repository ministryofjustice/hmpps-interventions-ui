import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../models/draftReferral'
import errorMessages from '../../utils/errorMessages'
import FormUtils from '../../utils/formUtils'
import { FormValidationError } from '../../utils/formValidationError'
import { FormData } from '../../utils/forms/formData'

export default class EnforceableDaysForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: EnforceableDaysForm.validations,
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
        maximumEnforceableDays: Number(this.request.body['maximum-enforceable-days']),
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('maximum-enforceable-days')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.maximumEnforceableDays.empty)
        .bail()
        .trim()
        .isNumeric()
        .withMessage(errorMessages.maximumEnforceableDays.notNumber)
        .bail()
        .isInt()
        .withMessage(errorMessages.maximumEnforceableDays.notWholeNumber)
        .bail()
        .isInt({ min: 1 })
        .withMessage(errorMessages.maximumEnforceableDays.tooSmall),
    ]
  }

  get isValid(): boolean {
    return this.error == null
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

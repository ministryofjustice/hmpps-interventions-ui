import { Request } from 'express'
import { ValidationChain, body, Result, ValidationError } from 'express-validator'
import errorMessages from '../../../../utils/errorMessages'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'
import { FormData } from '../../../../utils/forms/formData'
import ReferralComplexityLevel from '../../../../models/referralComplexityLevel'

export default class ComplexityLevelForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<ReferralComplexityLevel>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: ComplexityLevelForm.validations,
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
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [body('complexity-level-id').notEmpty().withMessage(errorMessages.complexityLevel.empty)]
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

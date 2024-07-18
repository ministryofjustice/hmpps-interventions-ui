import { Request } from 'express'
import { Result } from 'express-validator/src/validation-result'
import { ValidationChain, ValidationError, body } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormValidationError } from '../../../utils/formValidationError'
import FormUtils from '../../../utils/formUtils'
import { AmendProbationOfficeUpdate } from '../../../models/referralProbationOffice'

export default class AmendProbationOfficeForm {
  constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>
  ) {}

  static async createForm(request: Request): Promise<AmendProbationOfficeForm> {
    return new AmendProbationOfficeForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations() })
    )
  }

  get paramsForUpdate(): AmendProbationOfficeUpdate {
    return {
      probationOffice: this.request.body['probation-office'],
    }
  }

  static validations(): ValidationChain[] {
    return [
      body('probation-office').notEmpty({ ignore_whitespace: true }).withMessage(errorMessages.probationOffice.empty),
    ]
  }

  get error(): FormValidationError | null {
    if (this.result.isEmpty()) {
      return null
    }

    return {
      errors: this.result.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }
}

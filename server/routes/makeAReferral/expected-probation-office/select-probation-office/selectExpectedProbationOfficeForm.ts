import { Request } from 'express'
import { Result } from 'express-validator/src/validation-result'
import { ValidationChain, ValidationError, body } from 'express-validator'
import DraftReferral from '../../../../models/draftReferral'
import FormUtils from '../../../../utils/formUtils'
import errorMessages from '../../../../utils/errorMessages'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class SelectExpectedProbationOfficeForm {
  constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>
  ) {}

  static async createForm(request: Request): Promise<SelectExpectedProbationOfficeForm> {
    return new SelectExpectedProbationOfficeForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations() })
    )
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      expectedProbationOffice: this.request.body['expected-probation-office'],
      expectedProbationOfficeUnKnownReason: null,
    }
  }

  static validations(): ValidationChain[] {
    return [
      body('expected-probation-office')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.expectedProbationOffice.empty),
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

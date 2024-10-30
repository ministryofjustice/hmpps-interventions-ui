import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { AmendProbationPractitionerPhoneNumberUpdate } from '../../../models/referralProbationPractitionerPhoneNumber'

export default class AmendProbationPractitionerPhoneNumberForm {
  constructor(
    private readonly request: Request,
    private readonly beforePpPhoneNumber: string
  ) {}

  async data(): Promise<FormData<AmendProbationPractitionerPhoneNumberUpdate>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendProbationPractitionerPhoneNumberForm.validations(this.request, this.beforePpPhoneNumber),
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
        ppPhoneNumber: this.request.body['amend-probation-practitioner-phone-number'],
      },
      error: null,
    }
  }

  static validations(request: Request, beforePpPhoneNumber: string): ValidationChain[] {
    return [
      body('amend-probation-practitioner-phone-number')
        .notEmpty()
        .withMessage(errorMessages.probationPractitionerPhoneNumber.empty),
      body('amend-probation-practitioner-phone-number')
        .not()
        .equals(beforePpPhoneNumber)
        .withMessage(errorMessages.probationPractitionerPhoneNumber.unchanged),
      body('amend-probation-practitioner-phone-number')
        .isNumeric()
        .withMessage(errorMessages.probationPractitionerPhoneNumber.invalidPhoneNumber),
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

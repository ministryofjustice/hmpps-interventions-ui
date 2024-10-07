import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { AmendProbationPractitionerNameUpdate } from '../../../models/referralProbationPractitionerName'

export default class AmendProbationPractitionerNameForm {
  constructor(
    private readonly request: Request,
    private readonly beforePpName: string
  ) {}

  async data(): Promise<FormData<AmendProbationPractitionerNameUpdate>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendProbationPractitionerNameForm.validations(this.request, this.beforePpName),
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
        ppName: this.request.body['amend-probation-practitioner-name'],
      },
      error: null,
    }
  }

  static validations(request: Request, beforePpName: string): ValidationChain[] {
    return [
      body('amend-probation-practitioner-name').notEmpty().withMessage(errorMessages.probationPractitionerName.empty),
      body('amend-probation-practitioner-name')
        .not()
        .equals(beforePpName)
        .withMessage(errorMessages.probationPractitionerName.unchanged),
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

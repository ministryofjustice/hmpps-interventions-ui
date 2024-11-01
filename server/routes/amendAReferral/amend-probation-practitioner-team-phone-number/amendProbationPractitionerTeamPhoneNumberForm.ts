import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { AmendProbationPractitionerTeamPhoneNumberUpdate } from '../../../models/referralProbationPractitionerTeamPhoneNumber'

export default class AmendProbationPractitionerTeamPhoneNumberForm {
  constructor(
    private readonly request: Request,
    private readonly beforePpTeamPhoneNumber: string
  ) {}

  async data(): Promise<FormData<AmendProbationPractitionerTeamPhoneNumberUpdate>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendProbationPractitionerTeamPhoneNumberForm.validations(
        this.request,
        this.beforePpTeamPhoneNumber
      ),
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
        ppTeamPhoneNumber: this.request.body['amend-probation-practitioner-team-phone-number'],
      },
      error: null,
    }
  }

  static validations(request: Request, beforePpPhoneNumber: string): ValidationChain[] {
    return [
      body('amend-probation-practitioner-team-phone-number')
        .notEmpty()
        .withMessage(errorMessages.probationPractitionerTeamPhoneNumber.empty),
      body('amend-probation-practitioner-team-phone-number')
        .not()
        .equals(beforePpPhoneNumber)
        .withMessage(errorMessages.probationPractitionerTeamPhoneNumber.unchanged),
      body('amend-probation-practitioner-team-phone-number')
        .isNumeric()
        .withMessage(errorMessages.probationPractitionerTeamPhoneNumber.invalidPhoneNumber),
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

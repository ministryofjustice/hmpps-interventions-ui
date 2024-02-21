import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../../models/draftReferral'
import errorMessages from '../../../../utils/errorMessages'
import FormUtils from '../../../../utils/formUtils'
import { FormValidationError } from '../../../../utils/formValidationError'
import { FormData } from '../../../../utils/forms/formData'

export default class UpdateProbationPractitionerEmailAddressForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: UpdateProbationPractitionerEmailAddressForm.validations,
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
        ndeliusPPEmailAddress: this.request.body['delius-probation-practitioner-email-address'],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('delius-probation-practitioner-email-address')
        .if(body('delius-probation-practitioner-email-address').notEmpty({ ignore_whitespace: true }))
        .isEmail()
        .withMessage(errorMessages.updateProbationPractitionerDetails.invalidEmail),
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

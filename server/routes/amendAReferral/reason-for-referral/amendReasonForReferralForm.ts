import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { ReferralDetailsUpdate } from '../../../models/referralDetails'

export default class AmendReasonForReferralForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<ReferralDetailsUpdate>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendReasonForReferralForm.validations,
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
        reasonForReferral: this.request.body['amend-reason-for-referral'],
        reasonForReferralFurtherInformation: this.request.body['amend-reason-for-referral-further-information'],
        reasonForChange: '',
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('amend-reason-for-referral').notEmpty().withMessage(errorMessages.reasonForReferral.empty),
      body('amend-reason-for-referral-further-information')
        .notEmpty()
        .withMessage(errorMessages.reasonForReferralFurtherInformation.empty),
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

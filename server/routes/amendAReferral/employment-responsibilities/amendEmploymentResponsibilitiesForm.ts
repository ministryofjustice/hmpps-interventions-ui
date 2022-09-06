import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import EnforceableDaysForm from '../../makeAReferral/enforceable-days/enforceableDaysForm'
import { ReferralDetailsUpdate } from '../../../models/referralDetails'
import { AmendReferralDetailsUpdate } from '../../../models/referralComplexityLevel'
import { FormValidationError } from '../../../utils/formValidationError'
import { AmendOtherNeeds } from '../../../models/OtherNeeds'

export default class AmendEmploymentResponsibilitiesForm {
  static readonly amendEmploymentResponsibilitiesReasonForChangeId = 'reason-for-change'

  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AmendOtherNeeds>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendEmploymentResponsibilitiesForm.validations,
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
        hasAdditionalResponsibilities: this.request.body['has-additional-responsibilities'] === 'yes',
        whenUnavailable:
          this.request.body['has-additional-responsibilities'] === 'yes' ? this.request.body['when-unavailable'] : null,
        reasonForChange:
          this.request.body[AmendEmploymentResponsibilitiesForm.amendEmploymentResponsibilitiesReasonForChangeId],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('when-unavailable')
        .if(body('has-additional-responsibilities').equals('yes'))
        .notEmpty()
        .withMessage(errorMessages.employmentResponsibilities.whenUnavailable.empty),
      body(AmendEmploymentResponsibilitiesForm.amendEmploymentResponsibilitiesReasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
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

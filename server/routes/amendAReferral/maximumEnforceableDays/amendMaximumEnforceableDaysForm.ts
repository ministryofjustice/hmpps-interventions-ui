import { Request } from 'express'
import { body, ValidationChain } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import EnforceableDaysForm from '../../makeAReferral/enforceable-days/enforceableDaysForm'
import { ReferralDetailsUpdate } from '../../../models/referralDetails'

export default class AmendMaximumEnforceableDaysForm {
  private enforceableDaysForm: EnforceableDaysForm

  static readonly reasonForChangeId = 'reason-for-change'

  constructor(private readonly request: Request) {
    this.enforceableDaysForm = new EnforceableDaysForm(request)
  }

  static get validations(): ValidationChain[] {
    return [
      body(AmendMaximumEnforceableDaysForm.reasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
    ]
  }

  async data(): Promise<FormData<ReferralDetailsUpdate>> {
    const enforceableDaysResult = await this.enforceableDaysForm.data()
    const reasonResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendMaximumEnforceableDaysForm.validations,
    })

    const reasonError = FormUtils.validationErrorFromResult(reasonResult)

    if (reasonError === null && enforceableDaysResult.error === null) {
      return {
        error: null,
        paramsForUpdate: {
          reasonForChange: this.request.body[AmendMaximumEnforceableDaysForm.reasonForChangeId],
          maximumEnforceableDays: enforceableDaysResult.paramsForUpdate.maximumEnforceableDays,
        },
      }
    }

    return {
      error: {
        errors: (reasonError?.errors || []).concat(enforceableDaysResult.error?.errors || []),
      },
      paramsForUpdate: null,
    }
  }
}

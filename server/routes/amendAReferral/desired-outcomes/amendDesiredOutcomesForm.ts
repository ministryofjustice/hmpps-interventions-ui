import { Request } from 'express'
import { ValidationChain, body, Result, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import { FormValidationError } from '../../../utils/formValidationError'
import { FormData } from '../../../utils/forms/formData'
import FormUtils from '../../../utils/formUtils'
import { ReferralDesiredOutcomesUpdate } from '../../../models/referralDesiredOutcomes'

export default class AmendDesiredOutcomesForm {
  constructor(private readonly request: Request) {}

  static readonly reasonForChangeId = 'reason-for-change'

  static readonly desiredOutcomesId = 'desired-outcomes-ids'

  async data(): Promise<FormData<Partial<ReferralDesiredOutcomesUpdate>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AmendDesiredOutcomesForm.validations,
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
        desiredOutcomesIds: this.request.body[AmendDesiredOutcomesForm.desiredOutcomesId],
        reasonForChange: this.request.body[AmendDesiredOutcomesForm.reasonForChangeId],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body(AmendDesiredOutcomesForm.reasonForChangeId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.amendReferralFields.missingReason),
      body(AmendDesiredOutcomesForm.desiredOutcomesId).notEmpty().withMessage(errorMessages.desiredOutcomes.empty),
      body(AmendDesiredOutcomesForm.desiredOutcomesId)
        .custom((value, { req }) => {
          const updated = value?.slice()?.sort()?.join()
          const original = req.body?.origOutcomes?.slice()?.sort()?.join()
          return original !== updated
        })
        .withMessage(errorMessages.desiredOutcomes.noChanges),
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

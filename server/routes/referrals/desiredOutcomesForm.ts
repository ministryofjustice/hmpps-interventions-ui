import { Request } from 'express'
import { ValidationChain, body, Result, ValidationError } from 'express-validator'
import DraftReferral from '../../models/draftReferral'
import errorMessages from '../../utils/errorMessages'
import { FormValidationError } from '../../utils/formValidationError'
import { FormData } from '../../utils/forms/formData'
import FormUtils from '../../utils/formUtils'

export default class DesiredOutcomesForm {
  constructor(private readonly request: Request) {}

  // TODO: return Partial<ReferralDesiredOutcomes> when we update the code for single-service referrals to use the new PATCH function.
  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: DesiredOutcomesForm.validations,
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
        desiredOutcomesIds: this.request.body['desired-outcomes-ids'],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [body('desired-outcomes-ids').notEmpty().withMessage(errorMessages.desiredOutcomes.empty)]
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

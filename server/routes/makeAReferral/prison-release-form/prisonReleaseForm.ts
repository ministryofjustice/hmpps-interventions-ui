import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral, { CurrentLocationType } from '../../../models/draftReferral'
import errorMessages from '../../../utils/errorMessages'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'

export default class PrisonReleaseForm {
  private constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>,
    private readonly referral: DraftReferral
  ) {}

  static async createForm(request: Request, referral: DraftReferral): Promise<PrisonReleaseForm> {
    return new PrisonReleaseForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations() }),
      referral
    )
  }

  static validations(): ValidationChain[] {
    return [body('prison-release').isIn(['yes', 'no']).withMessage(errorMessages.prisonRelease.emptyRadio)]
  }

  get isValid(): boolean {
    return this.error == null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      isReferralReleasingIn12Weeks: this.request.body['prison-release'] === 'yes',
      personCurrentLocationType: CurrentLocationType.custody,
    }
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

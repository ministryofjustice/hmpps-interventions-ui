import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'

export default class ReferralTypeForm {
  private constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>,
    private readonly referral: DraftReferral
  ) {}

  static async createForm(request: Request, referral: DraftReferral): Promise<ReferralTypeForm> {
    return new ReferralTypeForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations() }),
      referral
    )
  }

  static validations(): ValidationChain[] {
    return [
      body('current-location').isIn(['CUSTODY', 'COMMUNITY']).withMessage(errorMessages.custodyLocation.emptyRadio),
    ]
  }

  get isValid(): boolean {
    return this.error == null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      personCurrentLocationType: this.request.body['current-location'],
    }
  }

  private get isCustody(): boolean {
    return this.request.body['current-location'] === 'CUSTODY'
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

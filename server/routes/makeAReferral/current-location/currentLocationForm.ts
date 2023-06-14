import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../models/draftReferral'
import errorMessages from '../../../utils/errorMessages'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'

export default class CurrentLocationForm {
  private constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>,
    private readonly referral: DraftReferral
  ) {}

  static async createForm(request: Request, referral: DraftReferral): Promise<CurrentLocationForm> {
    return new CurrentLocationForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations(referral) }),
      referral
    )
  }

  static validations(referral: DraftReferral): ValidationChain[] {
    const firstName = referral.serviceUser?.firstName ?? ''
    return [
      body('current-location').isIn(['CUSTODY', 'COMMUNITY']).withMessage(errorMessages.custodyLocation.emptyRadio),
      body('prison-select')
        .if(body('current-location').equals('CUSTODY'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.custodyLocation.empty(firstName)),
    ]
  }

  get isValid(): boolean {
    return this.error == null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      personCurrentLocationType: this.request.body['current-location'],
      personCustodyPrisonId: this.isCustody ? this.request.body['prison-select'] : null,
    }
  }

  private get isCustody(): boolean {
    return this.request.body['current-location'] === 'CUSTODY'
  }

  get error(): FormValidationError | null {
    if (this.result.isEmpty()) {
      return null
    }

    return FormUtils.getFormValidationError(this.result)
  }
}

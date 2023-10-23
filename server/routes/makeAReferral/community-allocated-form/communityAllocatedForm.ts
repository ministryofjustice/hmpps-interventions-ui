import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import DraftReferral from '../../../models/draftReferral'
import errorMessages from '../../../utils/errorMessages'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'

export default class CommunityAllocatedForm {
  private constructor(
    private readonly request: Request,
    private readonly result: Result<ValidationError>,
    private readonly referral: DraftReferral
  ) {}

  static async createForm(request: Request, referral: DraftReferral): Promise<CommunityAllocatedForm> {
    return new CommunityAllocatedForm(
      request,
      await FormUtils.runValidations({ request, validations: this.validations() }),
      referral
    )
  }

  static validations(): ValidationChain[] {
    return [body('community-allocated').isIn(['yes', 'no']).withMessage(errorMessages.communityAllocated.emptyRadio)]
  }

  get isValid(): boolean {
    return this.error == null
  }

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      allocatedCommunityPP: this.request.body['community-allocated'] === 'yes',
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

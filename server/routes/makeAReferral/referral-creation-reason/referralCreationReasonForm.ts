import { Request } from 'express'
import DraftReferral from '../../../models/draftReferral'
import { FormData } from '../../../utils/forms/formData'

export default class ReferralCreationReasonForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    return {
      paramsForUpdate: {
        reasonForReferralCreationBeforeAllocation: this.request.body['referral-creation-reason-before-allocation'],
      },
      error: null,
    }
  }
}

import { Request } from 'express'
import DraftReferral from '../../../../models/draftReferral'
import { FormData } from '../../../../utils/forms/formData'

export default class UpdateProbationPractitionerPduForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    return {
      paramsForUpdate: {
        ppPdu: this.request.body['delius-probation-practitioner-pdu'],
      },
      error: null,
    }
  }
}

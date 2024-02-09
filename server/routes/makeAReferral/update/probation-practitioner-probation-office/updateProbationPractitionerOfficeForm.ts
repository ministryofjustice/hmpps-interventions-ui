import { Request } from 'express'
import DraftReferral from '../../../../models/draftReferral'
import { FormData } from '../../../../utils/forms/formData'

export default class UpdateProbationPractitionerOfficeForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    return {
      paramsForUpdate: {
        ppProbationOffice: this.request.body['delius-probation-practitioner-office'],
      },
      error: null,
    }
  }
}

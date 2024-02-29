import { Request } from 'express'
import DraftReferral from '../../../../models/draftReferral'
import { FormData } from '../../../../utils/forms/formData'

export default class UpdateProbationPractitionerNameForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    return {
      paramsForUpdate: {
        ppName: this.request.body['delius-probation-practitioner-name'],
      },
      error: null,
    }
  }
}

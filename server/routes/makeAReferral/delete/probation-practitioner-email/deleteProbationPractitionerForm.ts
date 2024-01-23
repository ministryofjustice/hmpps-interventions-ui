import { Request } from 'express'
import DraftReferral from '../../../../models/draftReferral'

export default class DeleteProbationPractitionerForm {
  constructor(private readonly request: Request) {}

  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      ndeliusPPEmailAddress: '',
    }
  }
}

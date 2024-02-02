import DraftReferral from '../../../../models/draftReferral'

export default class DeleteProbationPractitionerPhoneNumberForm {
  get paramsForUpdate(): Partial<DraftReferral> {
    return {
      ndeliusPhoneNumber: '',
    }
  }
}

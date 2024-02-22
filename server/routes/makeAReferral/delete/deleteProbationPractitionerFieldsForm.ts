import DraftReferral from '../../../models/draftReferral'
import { FieldTypes } from './deleteProbationPractitionerFieldsPresenter'

export default class DeleteProbationPractitionerFieldsForm {
  constructor(private readonly fieldType: string) {}

  public get paramsForUpdate(): Partial<DraftReferral> | undefined {
    if (this.fieldType === FieldTypes.phoneNumber) {
      return {
        ppPhoneNumber: '',
        ndeliusPhoneNumber: '',
      }
    }
    if (this.fieldType === FieldTypes.probationOffice) {
      return {
        ppProbationOffice: '',
      }
    }
    if (this.fieldType === FieldTypes.teamPhoneNumber) {
      return {
        ppTeamPhoneNumber: '',
        ndeliusTeamPhoneNumber: '',
      }
    }
    if (this.fieldType === FieldTypes.emailAddress) {
      return {
        ppEmailAddress: '',
        ndeliusPPEmailAddress: '',
      }
    }
    return undefined
  }
}

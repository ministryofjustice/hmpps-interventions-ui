import DraftReferral from '../../../models/draftReferral'
import { FieldTypes } from './deleteProbationPractitionerFieldsPresenter'

export default class DeleteProbationPractitionerFieldsForm {
  constructor(private readonly fieldType: string) {}

  public get paramsForUpdate(): Partial<DraftReferral> | undefined {
    if (this.fieldType === FieldTypes.phoneNumber) {
      return {
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
        ndeliusTeamPhoneNumber: '',
      }
    }
    if (this.fieldType === FieldTypes.emailAddress) {
      return {
        ndeliusPPEmailAddress: '',
      }
    }
    return undefined
  }
}

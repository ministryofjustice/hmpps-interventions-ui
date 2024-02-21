export enum FieldTypes {
  phoneNumber = 'phone-number',
  emailAddress = 'email-address',
  probationOffice = 'probation-office',
  teamPhoneNumber = 'team-phone-number',
}

export default class DeleteProbationPractitionerFieldsPresenter {
  backLinkUrl: string

  constructor(
    private readonly id: string,
    private readonly crn: string,
    private readonly paramName: string,
    private readonly firstName: string | null = null,
    private readonly lastName: string | null = null
  ) {
    this.backLinkUrl = `/referrals/${id}/confirm-probation-practitioner-details`
  }

  readonly text = {
    heading: `${this.fieldName()}`,
    title: `Are you sure you want to delete the ${this.fieldName()}?`,
    label: `${this.firstName} ${this.lastName} (CRN: ${this.crn})`,
  }

  private fieldName() {
    if (this.paramName === FieldTypes.phoneNumber) {
      return 'probation practitioner phone number'
    }
    if (this.paramName === FieldTypes.emailAddress) {
      return 'probation practitioner email address'
    }
    if (this.paramName === FieldTypes.probationOffice) {
      return 'probation office'
    }
    if (this.paramName === FieldTypes.teamPhoneNumber) {
      return 'team phone number'
    }
    return ''
  }
}

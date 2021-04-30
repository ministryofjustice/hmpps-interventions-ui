interface Disability {
  disabilityType: {
    description: string
  }
  endDate: string
  notes: string
  startDate: string
}

interface OffenderLanguages {
  primaryLanguage: string
}

interface ContactDetails {
  emailAddresses?: string[] | null
  phoneNumbers?: PhoneNumber[] | null
}

interface PhoneNumber {
  number: string | null
  type: string | null
}

interface OtherIds {
  crn: string
}

interface OffenderProfile {
  offenderLanguages: OffenderLanguages
  ethnicity: string
  religion: string
  disabilities: Disability[] | null
}

export default interface DeliusServiceUser {
  // TODO IC-620 validate this data properly
  otherIds: OtherIds
  offenderProfile: OffenderProfile
  title: string | null
  firstName: string | null
  surname: string | null
  dateOfBirth: string | null
  gender: string | null
  contactDetails: ContactDetails
}

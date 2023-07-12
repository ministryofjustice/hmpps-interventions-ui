export default interface DeliusServiceUser {
  crn: string
  name: Name
  dateOfBirth: string
  title?: string
  gender?: string
  profile?: Profile
  contactDetails: ContactDetails
}

export interface Name {
  forename: string
  surname: string
}

export interface Profile {
  primaryLanguage?: string
  ethnicity?: string
  religion?: string
  disabilities: Disability[]
}

export interface Disability {
  type: string
  start: Date
  notes: string
}

export interface ContactDetails {
  noFixedAbode: boolean
  mainAddress?: Address
  emailAddress?: string
  telephoneNumber?: string
  mobileNumber?: string
}

export interface Address {
  buildingName?: string
  buildingNumber?: string
  streetName?: string
  district?: string
  town?: string
  county?: string
  postcode?: string
}

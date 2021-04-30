export default interface ServiceUser {
  crn: string
  title: string | null
  firstName: string | null
  lastName: string | null
  dateOfBirth: string | null
  gender: string | null
  ethnicity: string | null
  preferredLanguage: string | null
  religionOrBelief: string | null
  disabilities: string[] | null
}

export interface DeliusAccess {
  crn: string
  userExcluded: boolean
  userRestricted: boolean
  exclusionMessage: string
  restrictionMessage: string
}

export default interface DeliusUserAccess {
  access: DeliusAccess[]
}

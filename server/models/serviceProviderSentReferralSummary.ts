export default interface ServiceProviderSentReferralSummary {
  referralId: string
  sentAt: string
  referenceNumber: string
  interventionTitle: string
  assignedToUserName?: string | null
  serviceUserFirstName: string | null
  serviceUserLastName: string | null
}

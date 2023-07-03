import User from './hmppsAuth/user'
import ServiceProvider from './serviceProvider'
import ServiceUser from './serviceUser'

export default interface SentReferralSummaries {
  id: string
  sentAt: string
  sentBy: User
  referenceNumber: string
  assignedTo: User | null
  serviceProvider: ServiceProvider
  interventionTitle: string
  serviceUser: ServiceUser
  supplementaryRiskId: string
  concludedAt: string | null
}

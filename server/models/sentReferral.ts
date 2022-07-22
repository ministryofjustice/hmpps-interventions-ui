import User from './hmppsAuth/user'
import EndOfServiceReport from './endOfServiceReport'
import { ReferralFields } from './draftReferral'
import ServiceUser from './serviceUser'

export default interface SentReferral {
  id: string
  sentAt: string
  referenceNumber: string
  referral: ReferralFields
  sentBy: User
  supplementaryRiskId: string
  assignedTo: User | null
  actionPlanId: string | null
  endRequestedAt: string | null
  endRequestedReason: string | null
  endRequestedComments: string | null
  endOfServiceReport: EndOfServiceReport | null
  endOfServiceReportCreationRequired: boolean
  concludedAt: string | null
  serviceUser?: ServiceUser | null
}

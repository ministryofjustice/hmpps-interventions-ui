import AuthUser from './authUser'
import EndOfServiceReport from './endOfServiceReport'
import { ReferralFields } from './draftReferral'

export default interface SentReferral {
  id: string
  sentAt: string
  referenceNumber: string
  referral: ReferralFields
  sentBy: AuthUser
  assignedTo: AuthUser | null
  actionPlanId: string | null
  endRequestedAt: string | null
  endRequestedReason: string | null
  endRequestedComments: string | null
  endOfServiceReport: EndOfServiceReport | null
  concludedAt: string | null
}

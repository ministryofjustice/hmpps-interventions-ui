import User from './hmppsAuth/user'
import EndOfServiceReport from './endOfServiceReport'
import { ReferralFields } from './draftReferral'

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
  withdrawalState: WithdrawalState | null
}

export enum WithdrawalState {
  preICA = 'PRE_ICA_WITHDRAWAL',
  postICA = 'POST_ICA_WITHDRAWAL',
  postICACLosed = 'POST_ICA_CLOSE_REFERRAL_EARLY',
}

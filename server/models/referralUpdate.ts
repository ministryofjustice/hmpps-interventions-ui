import DraftReferral from './draftReferral'

export interface ReferralDetailsFormUpdate {
  draftReferral: Partial<DraftReferral>
  reasonForChange: string | null
}

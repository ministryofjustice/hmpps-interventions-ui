import DraftReferral from "./draftReferral";

export interface ReferralUpdate {
  draftReferral: Partial<DraftReferral>
  reasonForUpdate: string | null
}

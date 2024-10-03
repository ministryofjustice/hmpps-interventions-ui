interface ReferralDetailsFields {
  maximumEnforceableDays?: number | null
  completionDeadline?: string | null
  furtherInformation?: string | null
  reasonForReferral?: string | null
  reasonForReferralFurtherInformation?: string | null
}

export default interface ReferralDetails extends ReferralDetailsFields {
  referralId: string
}

export interface ReferralDetailsUpdate extends ReferralDetailsFields {
  reasonForChange: string
  expectedProbationOffice?: string | null
}

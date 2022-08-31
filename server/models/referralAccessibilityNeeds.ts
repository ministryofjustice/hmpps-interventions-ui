export default interface ReferralAccessibilityNeeds {
  accessibilityNeeds: string
}

export interface AmendReferralDetailsUpdate extends ReferralAccessibilityNeeds {
  reasonForChange: string
  changesMade: boolean
}

export default interface ReferralComplexityLevel {
  serviceCategoryId: string
  complexityLevelId: string
}

export interface AmendReferralDetailsUpdate extends ReferralComplexityLevel {
  reasonForChange: string
}

export default interface ReferralNeedsAndRequirement {
  furtherInformation?: string | null
  additionalNeedsInformation?: string | null
  accessibilityNeeds?: string | null
  needsInterpreter?: boolean | null
  interpreterLanguage?: string | null
  hasAdditionalResponsibilities?: boolean | null
  whenUnavailable?: string | null
}
export interface ReferralNeedsAndRequirementUpdate extends ReferralNeedsAndRequirement {
  reasonForChange: string
}

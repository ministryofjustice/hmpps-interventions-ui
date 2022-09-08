export default interface AmendNeedsAndRequirements {
  hasAdditionalResponsibilities?: boolean | null
  whenUnavailable?: string | null
  accessibilityNeeds?: string | null
  additionalNeedsInformation?: string | null
  reasonForChange: string
  needsInterpreter?: boolean | null
  interpreterLanguage?: string | null
}

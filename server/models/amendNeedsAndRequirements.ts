export default interface AmendNeedsAndRequirements{
     hasAdditionalResponsibilities?: Boolean | null,
     whenUnavailable?: String | null,
     accessibilityNeeds?: String | null,
     additionalNeedsInformation?: String |null,
     reasonForChange: String,
     needsInterpreter?: Boolean | null,
     interpreterLanguage?: String| null,
}
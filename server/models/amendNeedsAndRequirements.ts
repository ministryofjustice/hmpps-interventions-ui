export default interface AmendNeedsAndRequirements{
     hasAdditionalResponsibilities?: Boolean | null,
     whenUnavailable?: String | null,
     accessibilityNeeds?: String | null,
     additionalNeedsInformation?: String |null,
     reasonForChange: string,
     needsInterpreter?: Boolean | null,
     interpreterLanguage?: String| null,
}
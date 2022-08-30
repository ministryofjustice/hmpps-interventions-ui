interface AmendAndNeedsRequirementsIntepreter {
     needsInterpreter?: Boolean | null,
     interpreterLanguage?: String| null,
}


export interface AmmendNeedsRequirementsDetailsUpdate extends AmendAndNeedsRequirementsIntepreter {
  reasonForChange: string
  changesMade: boolean | null
}

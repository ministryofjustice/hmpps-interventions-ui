interface AmendAndNeedsRequirementsIntepreter {
  needsInterpreter: boolean
  interpreterLanguage: string
}

export interface AmmendNeedsRequirementsDetailsUpdate extends AmendAndNeedsRequirementsIntepreter {
  reasonForChange: string
  changesMade: boolean
}

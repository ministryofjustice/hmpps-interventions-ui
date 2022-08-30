export default interface OtherNeeds {
  hasAdditionalResponsibilities?: boolean
  whenUnavailable?: string
}

export interface AmendOtherNeeds extends OtherNeeds {
  reasonForChange: string
}

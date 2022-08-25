export default interface ReferralAdditionalInformation {
  additionalNeedsInformation: string | null
}
export interface ReferralAdditionalInformationUpdate extends ReferralAdditionalInformation {
  reasonForChange: string | null
  changesMade: boolean
}

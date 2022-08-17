export default interface ReferralDesiredOutcomes {
  serviceCategoryId: string
  desiredOutcomesIds: string[]
}
export interface ReferralDesiredOutcomesUpdate extends ReferralDesiredOutcomes {
  reasonForChange: string
  changesMade: boolean
}

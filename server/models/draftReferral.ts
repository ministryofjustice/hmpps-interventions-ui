import ReferralComplexityLevel from './referralComplexityLevel'
import ReferralDesiredOutcomes from './referralDesiredOutcomes'
import ServiceProvider from './serviceProvider'
import ServiceUser from './serviceUser'

type WithNullableValues<T> = { [K in keyof T]: T[K] | null }

export interface ReferralFields {
  createdAt: string
  completionDeadline: string
  serviceProvider: ServiceProvider
  interventionId: string
  serviceCategoryIds: string[]
  complexityLevels: ReferralComplexityLevel[]
  furtherInformation: string
  relevantSentenceId: number
  desiredOutcomes: ReferralDesiredOutcomes[]
  additionalNeedsInformation: string
  accessibilityNeeds: string
  needsInterpreter: boolean
  interpreterLanguage: string | null
  hasAdditionalResponsibilities: boolean
  whenUnavailable: string | null
  serviceUser: ServiceUser
  maximumEnforceableDays: number
}

export default interface DraftReferral extends WithNullableValues<ReferralFields> {
  id: string
  createdAt: string
  serviceUser: ServiceUser
  interventionId: string
  // risk information is a special field which is only set on the draft referral
  additionalRiskInformation: string | null
}
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
  serviceCategoryId: string
  serviceCategoryIds: string[]
  complexityLevelId: string // deprecated in favour of complexityLevels
  complexityLevels: ReferralComplexityLevel[]
  furtherInformation: string
  relevantSentenceId: number
  desiredOutcomesIds: string[] // deprecated in favour of desiredOutcomes
  desiredOutcomes: ReferralDesiredOutcomes[]
  additionalNeedsInformation: string
  accessibilityNeeds: string
  needsInterpreter: boolean
  interpreterLanguage: string | null
  hasAdditionalResponsibilities: boolean
  whenUnavailable: string | null
  serviceUser: ServiceUser
  additionalRiskInformation: string
  usingRarDays: boolean
  maximumRarDays: number | null
}

export default interface DraftReferral extends WithNullableValues<ReferralFields> {
  id: string
  createdAt: string
  serviceUser: ServiceUser
  interventionId: string
}

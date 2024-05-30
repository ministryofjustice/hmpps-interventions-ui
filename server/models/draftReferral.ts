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
  personCurrentLocationType: CurrentLocationType | null
  personCustodyPrisonId: string | null
  alreadyKnowPrisonName: boolean | null
  hasExpectedReleaseDate: boolean | null
  expectedReleaseDate: string | null
  expectedReleaseDateMissingReason: string | null
  ndeliusPPName: string | null
  ndeliusPPEmailAddress: string | null
  ndeliusPDU: string | null
  ndeliusPhoneNumber: string | null
  ndeliusTeamPhoneNumber: string | null
  ppName: string | null
  ppEmailAddress: string | null
  ppPdu: string | null
  ppProbationOffice: string | null
  ppEstablishment: string | null
  ppPhoneNumber: string | null
  ppTeamPhoneNumber: string | null
  hasValidDeliusPPDetails: boolean | null
  isReferralReleasingIn12Weeks: boolean | null
  roleOrJobTitle: string | null
  hasMainPointOfContactDetails: boolean | null
  ppLocationType: string | null
  allocatedCommunityPP: boolean | null
  reasonForReferral: string | null
  withdrawalState: string | null
}

export enum CurrentLocationType {
  custody = 'CUSTODY',
  community = 'COMMUNITY',
}

export default interface DraftReferral extends WithNullableValues<ReferralFields> {
  id: string
  createdAt: string
  serviceUser: ServiceUser
  serviceProvider: ServiceProvider
  interventionId: string
  // risk information is a special field which is only set on the draft referral
  additionalRiskInformation: string | null
  contractTypeName: string
}

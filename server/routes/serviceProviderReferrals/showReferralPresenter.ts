import { AuthUser } from '../../data/hmppsAuthClient'
import { DeliusServiceUser, DeliusUser } from '../../services/communityApiService'
import { SentReferral, ServiceCategory } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'
import ServiceUserDetailsPresenter from '../referrals/serviceUserDetailsPresenter'
import { FormValidationError } from '../../utils/formValidationError'
import ViewUtils from '../../utils/viewUtils'
import ReferralOverviewPagePresenter, { ReferralPageSection } from './referralOverviewPagePresenter'

export default class ShowReferralPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly sentBy: DeliusUser,
    serviceUser: DeliusServiceUser,
    private readonly assignee: AuthUser | null,
    private readonly assignEmailError: FormValidationError | null
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralPageSection.Details,
      sentReferral,
      serviceUser
    )
  }

  readonly assignmentFormAction = `/service-provider/referrals/${this.sentReferral.id}/assignment/check`

  readonly text = {
    title:
      this.sentReferral.assignedTo === null
        ? `Who do you want to assign this ${this.serviceCategory.name} referral to?`
        : `${utils.convertToProperCase(this.serviceCategory.name)} referral for ${ReferralDataPresenterUtils.fullName(
            this.sentReferral.referral.serviceUser
          )}`,
    interventionDetailsSummaryHeading: `${utils.convertToProperCase(this.serviceCategory.name)} intervention details`,
    assignedTo: this.assigneeFullNameOrUnassigned,
    errorMessage: ReferralDataPresenterUtils.errorMessage(this.assignEmailError, 'email'),
  }

  readonly probationPractitionerDetails: SummaryListItem[] = [
    { key: 'Name', lines: [`${this.sentBy.firstName} ${this.sentBy.surname}`], isList: false },
    { key: 'Email address', lines: [this.sentBy.email ?? ''], isList: false },
  ]

  get interventionDetails(): SummaryListItem[] {
    const selectedDesiredOutcomes = this.serviceCategory.desiredOutcomes
      .filter(desiredOutcome => this.sentReferral.referral.desiredOutcomesIds.includes(desiredOutcome.id))
      .map(desiredOutcome => desiredOutcome.description)

    const selectedComplexityLevel = this.serviceCategory.complexityLevels.find(
      complexityLevel => complexityLevel.id === this.sentReferral.referral.complexityLevelId
    )

    const complexityLevelText = {
      level: selectedComplexityLevel?.title || 'Level not found',
      text: selectedComplexityLevel?.description || 'Description not found',
    }

    return [
      { key: 'Sentence information', lines: ['Not currently set'], isList: false },
      { key: 'Desired outcomes', lines: selectedDesiredOutcomes, isList: true },
      { key: 'Complexity level', lines: [complexityLevelText.level, complexityLevelText.text], isList: false },
      {
        key: 'Date to be completed by',
        lines: [ViewUtils.govukFormattedDateFromStringOrNull(this.sentReferral.referral.completionDeadline)],
        isList: false,
      },
      {
        key: 'Maximum number of enforceable days',
        lines: [this.sentReferral.referral.usingRarDays ? String(this.sentReferral.referral.maximumRarDays) : 'N/A'],
        isList: false,
      },
      {
        key: 'Further information for the provider',
        lines: [this.sentReferral.referral.furtherInformation || 'N/A'],
        isList: false,
      },
    ]
  }

  get serviceUserDetails(): SummaryListItem[] {
    return new ServiceUserDetailsPresenter(this.sentReferral.referral.serviceUser).summary
  }

  get serviceUserRisks(): SummaryListItem[] {
    return [
      { key: 'Risk to known adult', lines: ['Medium'], isList: false },
      { key: 'Risk to public', lines: ['Low'], isList: false },
      { key: 'Risk to children', lines: ['Low'], isList: false },
      { key: 'Risk to staff', lines: ['Low'], isList: false },
      {
        key: 'Additional risk information',
        lines: [this.sentReferral.referral.additionalRiskInformation],
        isList: false,
      },
    ]
  }

  get serviceUserNeeds(): SummaryListItem[] {
    return [
      { key: 'Criminogenic needs', lines: ['Thinking and attitudes', 'Accommodation'], isList: true },
      {
        key: 'Identify needs',
        lines: [this.sentReferral.referral.additionalNeedsInformation || 'N/A'],
        isList: false,
      },
      {
        key: 'Other mobility, disability or accessibility needs',
        lines: [this.sentReferral.referral.accessibilityNeeds || 'N/A'],
        isList: false,
      },
      {
        key: 'Interpreter required',
        lines: [this.sentReferral.referral.needsInterpreter ? 'Yes' : 'No'],
        isList: false,
      },
      { key: 'Interpreter language', lines: [this.sentReferral.referral.interpreterLanguage || 'N/A'], isList: false },
      {
        key: 'Primary language',
        lines: [this.sentReferral.referral.serviceUser.preferredLanguage || 'N/A'],
        isList: false,
      },
      {
        key: 'Caring or employment responsibilities',
        lines: [this.sentReferral.referral.hasAdditionalResponsibilities ? 'Yes' : 'No'],
        isList: false,
      },
      {
        key: `Provide details of when ${this.sentReferral.referral.serviceUser.firstName} will not be able to attend sessions`,
        lines: [this.sentReferral.referral.whenUnavailable || 'N/A'],
        isList: false,
      },
    ]
  }

  private get assigneeFullNameOrUnassigned(): string | null {
    if (!this.assignee) {
      return null
    }

    return `${this.assignee.firstName} ${this.assignee.lastName}`
  }
}

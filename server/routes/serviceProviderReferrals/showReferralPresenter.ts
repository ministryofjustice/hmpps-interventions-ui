import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import DeliusUser from '../../models/delius/deliusUser'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import PresenterUtils from '../../utils/presenterUtils'
import ServiceUserDetailsPresenter from '../referrals/serviceUserDetailsPresenter'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'

export default class ShowReferralPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly sentBy: DeliusUser,
    private readonly assignee: AuthUserDetails | null,
    private readonly assignEmailError: FormValidationError | null
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Details,
      sentReferral.id,
      'service-provider'
    )
  }

  readonly assignmentFormAction = `/service-provider/referrals/${this.sentReferral.id}/assignment/check`

  readonly text = {
    interventionDetailsSummaryHeading: `${utils.convertToProperCase(this.serviceCategory.name)} intervention details`,
    assignedTo: this.assigneeFullNameOrUnassigned,
    errorMessage: PresenterUtils.errorMessage(this.assignEmailError, 'email'),
  }

  readonly probationPractitionerDetails: SummaryListItem[] = [
    { key: 'Name', lines: [`${this.sentBy.firstName} ${this.sentBy.surname}`] },
    { key: 'Email address', lines: [this.sentBy.email ?? ''] },
  ]

  get interventionDetails(): SummaryListItem[] {
    // const selectedDesiredOutcomes = this.serviceCategory.desiredOutcomes
    //   .filter(desiredOutcome => this.sentReferral.referral.desiredOutcomesIds.includes(desiredOutcome.id))
    //   .map(desiredOutcome => desiredOutcome.description)
    //
    // const selectedComplexityLevel = this.serviceCategory.complexityLevels.find(
    //   complexityLevel => complexityLevel.id === this.sentReferral.referral.complexityLevelId
    // )
    //
    // const complexityLevelText = {
    //   level: selectedComplexityLevel?.title || 'Level not found',
    //   text: selectedComplexityLevel?.description || 'Description not found',
    // }

    return [
      { key: 'Sentence information', lines: ['Not currently set'] },
      // { key: 'Desired outcomes', lines: selectedDesiredOutcomes, listStyle: ListStyle.noMarkers },
      // { key: 'Complexity level', lines: [complexityLevelText.level, complexityLevelText.text] },
      {
        key: 'Date to be completed by',
        lines: [PresenterUtils.govukFormattedDateFromStringOrNull(this.sentReferral.referral.completionDeadline)],
      },
      {
        key: 'Maximum number of enforceable days',
        lines: [this.sentReferral.referral.usingRarDays ? String(this.sentReferral.referral.maximumRarDays) : 'N/A'],
      },
      {
        key: 'Further information for the provider',
        lines: [this.sentReferral.referral.furtherInformation || 'N/A'],
      },
    ]
  }

  get serviceUserDetails(): SummaryListItem[] {
    return new ServiceUserDetailsPresenter(this.sentReferral.referral.serviceUser).summary
  }

  get serviceUserRisks(): SummaryListItem[] {
    return [
      { key: 'Risk to known adult', lines: ['Medium'] },
      { key: 'Risk to public', lines: ['Low'] },
      { key: 'Risk to children', lines: ['Low'] },
      { key: 'Risk to staff', lines: ['Low'] },
      {
        key: 'Additional risk information',
        lines: [this.sentReferral.referral.additionalRiskInformation],
      },
    ]
  }

  get serviceUserNeeds(): SummaryListItem[] {
    return [
      { key: 'Criminogenic needs', lines: ['Thinking and attitudes', 'Accommodation'], listStyle: ListStyle.noMarkers },
      {
        key: 'Identify needs',
        lines: [this.sentReferral.referral.additionalNeedsInformation || 'N/A'],
      },
      {
        key: 'Other mobility, disability or accessibility needs',
        lines: [this.sentReferral.referral.accessibilityNeeds || 'N/A'],
      },
      {
        key: 'Interpreter required',
        lines: [this.sentReferral.referral.needsInterpreter ? 'Yes' : 'No'],
      },
      { key: 'Interpreter language', lines: [this.sentReferral.referral.interpreterLanguage || 'N/A'] },
      {
        key: 'Primary language',
        lines: [this.sentReferral.referral.serviceUser.preferredLanguage || 'N/A'],
      },
      {
        key: 'Caring or employment responsibilities',
        lines: [this.sentReferral.referral.hasAdditionalResponsibilities ? 'Yes' : 'No'],
      },
      {
        key: `Provide details of when ${this.sentReferral.referral.serviceUser.firstName} will not be able to attend sessions`,
        lines: [this.sentReferral.referral.whenUnavailable || 'N/A'],
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

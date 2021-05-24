import SentReferral from '../../models/sentReferral'
import DeliusUser from '../../models/delius/deliusUser'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import PresenterUtils from '../../utils/presenterUtils'
import ServiceUserDetailsPresenter from '../referrals/serviceUserDetailsPresenter'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import Intervention from '../../models/intervention'
import ServiceCategory from '../../models/serviceCategory'
import ComplexityLevel from '../../models/complexityLevel'
import { TagArgs } from '../../utils/govukFrontendTypes'

export default class ShowReferralPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly intervention: Intervention,
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
    assignedTo: this.assigneeFullNameOrUnassigned,
    errorMessage: PresenterUtils.errorMessage(this.assignEmailError, 'email'),
  }

  readonly probationPractitionerDetails: SummaryListItem[] = [
    { key: 'Name', lines: [`${this.sentBy.firstName} ${this.sentBy.surname}`] },
    { key: 'Email address', lines: [this.sentBy.email ?? ''] },
  ]

  get referralServiceCategories(): ServiceCategory[] {
    const { serviceCategoryIds } = this.sentReferral.referral
    return this.intervention.serviceCategories.filter(it => serviceCategoryIds.includes(it.id))
  }

  serviceCategorySection(serviceCategory: ServiceCategory, tagMacro: (args: TagArgs) => string): SummaryListItem[] {
    const items: SummaryListItem[] = []

    const complexityLevel = this.getReferralComplexityLevelForServiceCategory(serviceCategory)
    if (complexityLevel === null) {
      items.push({ key: 'Complexity level', lines: ['Level not found'] })
    } else {
      items.push({
        key: 'Complexity level',
        lines: [tagMacro(PresenterUtils.complexityLevelTagArgs(complexityLevel)), complexityLevel.description],
      })
    }

    items.push({ key: 'Desired outcomes', lines: ['Outcomes not found'] })

    return items
  }

  private getReferralComplexityLevelForServiceCategory(serviceCategory: ServiceCategory): ComplexityLevel | null {
    const complexityLevelId = this.sentReferral.referral.complexityLevels.find(
      it => it.serviceCategoryId === serviceCategory.id
    )?.complexityLevelId

    // fixme: both cases here, the complexity level missing from the referral and the complexity level
    // missing from the service category are error conditions. should i actually just error out here??
    return serviceCategory.complexityLevels.find(it => it.id === complexityLevelId) || null
  }

  get interventionDetails(): SummaryListItem[] {
    return [
      { key: 'Service type', lines: [utils.convertToProperCase(this.intervention.contractType.name)] },
      { key: 'Sentence information', lines: ['Not currently set'] },
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

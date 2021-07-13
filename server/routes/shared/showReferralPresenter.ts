import SentReferral from '../../models/sentReferral'
import DeliusUser from '../../models/delius/deliusUser'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import PresenterUtils from '../../utils/presenterUtils'
import ServiceUserDetailsPresenter from '../referrals/service-user-details/serviceUserDetailsPresenter'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from './referralOverviewPagePresenter'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'
import Intervention from '../../models/intervention'
import ServiceCategory from '../../models/serviceCategory'
import ComplexityLevel from '../../models/complexityLevel'
import { TagArgs } from '../../utils/govukFrontendTypes'
import DesiredOutcome from '../../models/desiredOutcome'
import logger from '../../../log'
import DeliusConviction from '../../models/delius/deliusConviction'
import SentencePresenter from '../referrals/relevant-sentence/sentencePresenter'
import { SupplementaryRiskInformation } from '../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import { ExpandedDeliusServiceUser } from '../../models/delius/deliusServiceUser'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import RiskPresenter from './riskPresenter'
import { DeliusStaffDetails, DeliusTeam } from '../../models/delius/deliusStaffDetails'
import CalendarDay from '../../utils/calendarDay'
import { DeliusOffenderManager } from '../../models/delius/deliusOffenderManager'

export default class ShowReferralPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  riskPresenter: RiskPresenter

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly intervention: Intervention,
    private readonly conviction: DeliusConviction,
    private readonly riskInformation: SupplementaryRiskInformation,
    private readonly sentBy: DeliusUser,
    private readonly assignee: AuthUserDetails | null,
    private readonly assignEmailError: FormValidationError | null,
    readonly userType: 'service-provider' | 'probation-practitioner',
    readonly canAssignReferral: boolean,
    private readonly deliusServiceUser: ExpandedDeliusServiceUser,
    private readonly riskSummary: RiskSummary | null,
    private readonly staffDetails: DeliusStaffDetails | null,
    private readonly responsibleOfficers: DeliusOffenderManager[]
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Details,
      sentReferral.id,
      userType
    )

    this.riskPresenter = new RiskPresenter(riskSummary)
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

  get probationPractitionerTeamDetails(): SummaryListItem[] {
    const { activeTeam } = this
    return activeTeam == null
      ? [
          { key: 'Phone', lines: [] },
          { key: 'Email address', lines: [] },
        ]
      : [
          { key: 'Phone', lines: [`${activeTeam.telephone}`] },
          { key: 'Email address', lines: [`${activeTeam.emailAddress}`] },
        ]
  }

  get responsibleOfficersDetails(): SummaryListItem[][] {
    // This is a temporary step - I want to not break the page if fields are missing, most likely with dev data.
    // It will be removed / simplified when we switch to using a dedicated Responsible Officer endpoint.
    if (this.responsibleOfficers.length < 1) {
      return [
        [
          {
            key: 'Name',
            lines: ['Not found'],
          },
          {
            key: 'Phone',
            lines: ['Not found'],
          },
          {
            key: 'Email address',
            lines: ['Not found'],
          },
        ],
      ]
    }

    return this.responsibleOfficers.map(responsibleOfficer => {
      const { staff } = responsibleOfficer

      return [
        {
          key: 'Name',
          lines: [`${staff?.forenames || ''} ${staff?.surname || ''}`.trim() || 'Not found'],
        },
        {
          key: 'Phone',
          lines: [staff?.phoneNumber || 'Not found'],
        },
        {
          key: 'Email address',
          lines: [staff?.email || 'Not found'],
        },
      ]
    })
  }

  get referralServiceCategories(): ServiceCategory[] {
    const { serviceCategoryIds } = this.sentReferral.referral
    return this.intervention.serviceCategories.filter(it => serviceCategoryIds.includes(it.id))
  }

  private get activeTeam(): DeliusTeam | null {
    const today = new Date()
    const firstTeam = this.staffDetails?.teams
      ?.filter(team => {
        // teams without an end date are assumed to be active
        if (!team.endDate) {
          return true
        }

        // otherwise filter out teams with an end date in the past
        const endDate = CalendarDay.parseIso8601Date(team.endDate)?.utcDate
        return endDate && endDate >= today
      })
      .sort((teamA, teamB) => {
        // the ordering of teams with no start date is entirely arbitrary
        // we are going to guess that they are older than those with a start date
        if (!teamA.startDate) {
          return 1
        }

        if (!teamB.startDate) {
          return 0
        }

        const teamAStartDate = CalendarDay.parseIso8601Date(teamA.startDate)!.utcDate
        const teamBStartDate = CalendarDay.parseIso8601Date(teamB.startDate)!.utcDate
        return teamBStartDate.getDate() - teamAStartDate.getDate()
      })[0]
    return firstTeam || null
  }

  serviceCategorySection(serviceCategory: ServiceCategory, tagMacro: (args: TagArgs) => string): SummaryListItem[] {
    const items: SummaryListItem[] = []

    const complexityLevel = this.getReferralComplexityLevelForServiceCategory(serviceCategory)
    items.push({
      key: 'Complexity level',
      lines:
        complexityLevel !== null
          ? [tagMacro(PresenterUtils.complexityLevelTagArgs(complexityLevel)), complexityLevel.description]
          : ['No complexity level found for this service category'],
    })

    const desiredOutcomes = this.getReferralDesiredOutcomesForServiceCategory(serviceCategory)
    items.push({
      key: 'Desired outcomes',
      lines:
        desiredOutcomes.length > 0
          ? desiredOutcomes.map(it => it.description)
          : ['No desired outcomes found for this service category'],
    })

    return items
  }

  private getReferralDesiredOutcomesForServiceCategory(serviceCategory: ServiceCategory): DesiredOutcome[] {
    const outcomes: DesiredOutcome[] = []
    const desiredOutcomesIds = this.sentReferral.referral.desiredOutcomes.find(
      it => it.serviceCategoryId === serviceCategory.id
    )?.desiredOutcomesIds

    if (desiredOutcomesIds === undefined) {
      logger.error(
        { referralId: this.sentReferral.id, serviceCategoryId: serviceCategory.id },
        'no desired outcomes found for selected service category'
      )
      return []
    }

    desiredOutcomesIds.forEach(id => {
      const outcome = serviceCategory.desiredOutcomes.find(it => it.id === id)
      if (outcome === undefined) {
        logger.error(
          { referralId: this.sentReferral.id, serviceCategoryId: serviceCategory.id, desiredOutcomeId: id },
          'invalid desired outcome for selected service category'
        )
      } else {
        outcomes.push(outcome)
      }
    })

    return outcomes
  }

  private getReferralComplexityLevelForServiceCategory(serviceCategory: ServiceCategory): ComplexityLevel | null {
    const complexityLevelId = this.sentReferral.referral.complexityLevels.find(
      it => it.serviceCategoryId === serviceCategory.id
    )?.complexityLevelId

    if (complexityLevelId === undefined) {
      logger.error(
        { referralId: this.sentReferral.id, serviceCategoryId: serviceCategory.id },
        'no complexity level found found for selected service category'
      )
      return null
    }

    const complexityLevel = serviceCategory.complexityLevels.find(it => it.id === complexityLevelId)
    if (complexityLevel === undefined) {
      logger.error(
        {
          referralId: this.sentReferral.id,
          serviceCategoryId: serviceCategory.id,
          complexityLevelId,
        },
        'invalid complexity level for selected service category'
      )
      return null
    }

    return complexityLevel
  }

  get interventionDetails(): SummaryListItem[] {
    const sentencePresenter = new SentencePresenter(this.conviction)

    return [
      { key: 'Service type', lines: [utils.convertToProperCase(this.intervention.contractType.name)] },
      {
        key: 'Sentence',
        lines: [sentencePresenter.category],
      },
      {
        key: 'Subcategory',
        lines: [sentencePresenter.subcategory],
      },
      {
        key: 'End of sentence date',
        lines: [sentencePresenter.endOfSentenceDate],
      },
      {
        key: 'Date to be completed by',
        lines: [PresenterUtils.govukFormattedDateFromStringOrNull(this.sentReferral.referral.completionDeadline)],
      },
      {
        key: 'Maximum number of enforceable days',
        lines: [String(this.sentReferral.referral.maximumEnforceableDays)],
      },
      {
        key: 'Further information for the provider',
        lines: [this.sentReferral.referral.furtherInformation || 'N/A'],
      },
    ]
  }

  get sentenceInformationSummary(): SummaryListItem[] {
    const presenter = new SentencePresenter(this.conviction)

    return [
      {
        key: 'Sentence',
        lines: [presenter.category],
      },
      {
        key: 'Subcategory',
        lines: [presenter.subcategory],
      },
      {
        key: 'End of sentence date',
        lines: [presenter.endOfSentenceDate],
      },
    ]
  }

  get serviceUserDetails(): SummaryListItem[] {
    return new ServiceUserDetailsPresenter(this.sentReferral.referral.serviceUser, this.deliusServiceUser).summary
  }

  get serviceUserRisks(): SummaryListItem[] {
    return [
      {
        key: 'Additional risk information',
        lines: [this.riskInformation.riskSummaryComments],
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

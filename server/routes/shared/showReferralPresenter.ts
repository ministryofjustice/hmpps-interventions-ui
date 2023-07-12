import SentReferral from '../../models/sentReferral'
import { RamDeliusUser } from '../../models/delius/deliusUser'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import config from '../../config'
import PresenterUtils from '../../utils/presenterUtils'
import ServiceUserDetailsPresenter from '../makeAReferral/service-user-details/serviceUserDetailsPresenter'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from './referralOverviewPagePresenter'
import AuthUserDetails, { authUserFullName } from '../../models/hmppsAuth/authUserDetails'
import Intervention from '../../models/intervention'
import ServiceCategory from '../../models/serviceCategory'
import ComplexityLevel from '../../models/complexityLevel'
import { TagArgs } from '../../utils/govukFrontendTypes'
import DesiredOutcome from '../../models/desiredOutcome'
import logger from '../../../log'
import SentencePresenter from '../makeAReferral/relevant-sentence/sentencePresenter'
import { SupplementaryRiskInformation } from '../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import RoshPanelPresenter from './roshPanelPresenter'
import DateUtils from '../../utils/dateUtils'
import Prison from '../../models/prisonRegister/prison'
import ArnRiskSummaryView from '../makeAReferral/risk-information/oasys/arnRiskSummaryView'
import { DeliusResponsibleOfficer } from '../../models/delius/deliusResponsibleOfficer'
import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import { DeliusConviction } from '../../models/delius/deliusConviction'

export default class ShowReferralPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  roshPanelPresenter: RoshPanelPresenter

  supplementaryRiskInformationView: ArnRiskSummaryView

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly intervention: Intervention,
    private readonly conviction: DeliusConviction,
    readonly riskInformation: SupplementaryRiskInformation,
    private readonly sentBy: RamDeliusUser,
    private readonly prisons: Prison[],
    private readonly assignee: AuthUserDetails | null,
    private readonly assignEmailError: FormValidationError | null,
    readonly userType: 'service-provider' | 'probation-practitioner',
    readonly canAssignReferral: boolean,
    private readonly deliusServiceUser: DeliusServiceUser,
    readonly riskSummary: RiskSummary | null,
    private readonly deliusResponsibleOfficer: DeliusResponsibleOfficer | null,
    readonly showSuccess: boolean = false,
    private readonly dashboardOriginPage?: string,
    private readonly hasApprovedActionPlan: boolean = true
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Details,
      sentReferral.id,
      userType,
      dashboardOriginPage
    )
    this.roshPanelPresenter = new RoshPanelPresenter(riskSummary)
    this.supplementaryRiskInformationView = new ArnRiskSummaryView(riskSummary, riskInformation)
  }

  readonly assignmentFormAction = `/service-provider/referrals/${this.sentReferral.id}/assignment/start`

  readonly interventionDetailsHeading = 'Intervention details'

  get serviceUserNames(): string {
    return `${utils.convertToTitleCase(
      `${this.sentReferral.referral.serviceUser.firstName} ${this.sentReferral.referral.serviceUser.lastName}`
    )}`
  }

  get serviceUserDetailsHeading(): string {
    return `Personal details`
  }

  get serviceUserNeedsHeading(): string {
    return `Service user needs`
  }

  get interventionHeading(): string {
    return `${this.intervention.contractType.name} service`
  }

  get probationPractitionerDetailsHeading(): string {
    return `${this.serviceUserNames}'s probation practitioner`
  }

  get roshInformationHeading(): string {
    return `${this.serviceUserNames}'s risk of serious harm(RoSH) levels`
  }

  get serviceUserLocationDetailsHeading(): string {
    if (this.sentReferral.referral.personCurrentLocationType === 'COMMUNITY')
      return `${this.serviceUserNames}'s location`
    return `${this.serviceUserNames}'s location and expected release date`
  }

  get responsibleOfficerDetailsHeading(): string {
    return `${this.serviceUserNames}'s responsible officer details`
  }

  get riskInformationHeading(): string {
    return `${this.serviceUserNames}'s risk information`
  }

  get contactDetailsHeading(): string {
    return 'Address and contact details'
  }

  readonly text = {
    title: `${this.serviceUserNames}: referral details`,
    errorMessage: PresenterUtils.errorMessage(this.assignEmailError, 'email'),
    noCaseworkerAssigned: 'This intervention is not yet assigned to a caseworker.',
  }

  get closeHref(): string {
    return `/probation-practitioner/referrals/${this.sentReferral.id}/details`
  }

  get referralAssigned(): boolean {
    return this.assignee !== null
  }

  get isCustodyReferral(): boolean {
    return this.sentReferral.referral.personCurrentLocationType === 'CUSTODY'
  }

  get assignedCaseworkerFullName(): string | null {
    return this.referralAssigned ? authUserFullName(this.assignee!) : null
  }

  get assignedCaseworkerEmail(): string | null {
    return this.referralAssigned ? `${this.assignee!.email}` : null
  }

  readonly probationPractitionerDetailsForCommunity: SummaryListItem[] = [
    {
      key: 'Name',
      lines: [this.sentReferral.referral.ppName || this.sentReferral.referral.ndeliusPPName || 'Not found'],
    },
    { key: 'Email address', lines: [this.deriveEmailAddress] },
    {
      key:
        this.sentReferral.referral.ppProbationOffice !== null && this.sentReferral.referral.ppProbationOffice !== ''
          ? 'Probation Office'
          : 'PDU (Probation Delivery Unit)',
      lines: [
        this.sentReferral.referral.ppProbationOffice !== null && this.sentReferral.referral.ppProbationOffice !== ''
          ? this.sentReferral.referral.ppProbationOffice
          : this.sentReferral.referral.ppPdu || this.sentReferral.referral.ndeliusPDU || '',
      ],
    },
  ]

  readonly probationPractitionerDetailsForCustody: SummaryListItem[] = [
    { key: 'Name', lines: [`${this.sentBy.name.forename} ${this.sentBy.name.surname}`] },
    { key: 'Email address', lines: [this.sentBy.email ?? ''] },
  ]

  get deriveEmailAddress(): string {
    if (this.sentReferral.referral.ppEmailAddress) {
      return this.sentReferral.referral.ppEmailAddress
    }
    if (
      this.sentReferral.referral.ndeliusPPEmailAddress &&
      this.sentReferral.referral.ndeliusPPEmailAddress.toLowerCase() !== 'undefined'
    ) {
      return this.sentReferral.referral.ndeliusPPEmailAddress
    }
    return 'Not found'
  }

  get deliusResponsibleOfficersDetails(): SummaryListItem[] {
    if (this.deliusResponsibleOfficer === null) return []

    const officer = this.deliusResponsibleOfficer.communityManager.responsibleOfficer
      ? this.deliusResponsibleOfficer.communityManager
      : this.deliusResponsibleOfficer.prisonManager
    return [
      {
        key: 'Name',
        lines: [`${officer?.name?.forename || ''} ${officer?.name?.surname || ''}`.trim() || 'Not found'],
      },
      {
        key: 'Phone',
        lines: [officer?.telephoneNumber || 'Not found'],
      },
      {
        lines: [
          officer?.email || 'Not found - email notifications for this referral will be sent to the referring officer',
        ],
        key: 'Email address',
      },
      {
        key: 'Team phone',
        lines: [officer?.team?.telephoneNumber || 'Not found'],
      },
      {
        key: 'Team email address',
        lines: [officer?.team?.email || 'Not found'],
      },
    ]
  }

  get referralServiceCategories(): ServiceCategory[] {
    const { serviceCategoryIds } = this.sentReferral.referral
    return this.intervention.serviceCategories.filter(it => serviceCategoryIds.includes(it.id))
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
      changeLink:
        this.userType === 'probation-practitioner' && !this.hasApprovedActionPlan
          ? `/probation-practitioner/referrals/${this.sentReferral.id}/service-category/${serviceCategory.id}/update-complexity-level`
          : undefined,
    })

    const desiredOutcomes = this.getReferralDesiredOutcomesForServiceCategory(serviceCategory)
    items.push({
      key: 'Desired outcomes',
      lines:
        desiredOutcomes.length > 0
          ? desiredOutcomes.map(it => it.description)
          : ['No desired outcomes found for this service category'],
      changeLink:
        this.userType === 'probation-practitioner' && !this.hasApprovedActionPlan
          ? `/probation-practitioner/referrals/${this.sentReferral.id}/${serviceCategory.id}/update-desired-outcomes`
          : undefined,
    })

    return items
  }

  get canShowFullSupplementaryRiskInformation(): boolean {
    if (this.riskInformation.redactedRisk === undefined) {
      return false
    }
    return true
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
        key: 'Date intervention to be completed by',
        lines: [
          this.sentReferral.referral.completionDeadline
            ? DateUtils.formattedDate(this.sentReferral.referral.completionDeadline, { month: 'short' })
            : '',
        ],
        changeLink:
          this.userType === 'probation-practitioner'
            ? `/referrals/${this.sentReferral.id}/completion-deadline`
            : undefined,
      },
      {
        key: 'Maximum number of enforceable days',
        lines: [String(this.sentReferral.referral.maximumEnforceableDays)],
        changeLink:
          this.userType === 'probation-practitioner'
            ? `/probation-practitioner/referrals/${this.sentReferral.id}/update-maximum-enforceable-days`
            : undefined,
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

  get serviceUserDetails(): ServiceUserDetailsPresenter {
    return new ServiceUserDetailsPresenter(
      this.sentReferral.referral.serviceUser,
      this.deliusServiceUser,
      this.prisons,
      this.sentReferral.id,
      this.sentReferral.referral.personCurrentLocationType,
      this.sentReferral.referral.personCustodyPrisonId,
      this.sentReferral.referral.expectedReleaseDate,
      this.sentReferral.referral.expectedReleaseDateMissingReason
    )
  }

  get personalDetailSummary(): SummaryListItem[] {
    return this.serviceUserDetails.personalDetailsSummary
  }

  get contactDetailsSummary(): SummaryListItem[] {
    return this.serviceUserDetails.contactDetailsSummary
  }

  get serviceUserLocationDetails(): SummaryListItem[] {
    const { personCurrentLocationType } = this.sentReferral.referral

    if (config.featureFlags.custodyLocationEnabled) {
      if (personCurrentLocationType === 'CUSTODY') {
        const currentPrisonName = this.getPrisonName(this.sentReferral.referral.personCustodyPrisonId)
        const expectedReleaseInfo: string =
          this.sentReferral.referral.expectedReleaseDate !== ''
            ? this.sentReferral.referral.expectedReleaseDate!
            : this.sentReferral.referral.expectedReleaseDateMissingReason!
        return [
          {
            key: 'Location at time of referral',
            lines: [personCurrentLocationType ? utils.convertToProperCase(personCurrentLocationType) : ''],
          },
          {
            key: 'Current establishment',
            lines: [this.sentReferral.referral.personCustodyPrisonId ? currentPrisonName : ''],
          },
          {
            key: 'Expected release date',
            lines: [expectedReleaseInfo],
          },
        ]
      }
    }

    return [
      {
        key: 'Location at time of referral',
        lines: [personCurrentLocationType ? utils.convertToProperCase(personCurrentLocationType) : ''],
      },
    ]
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
      {
        key: 'Identify needs',
        lines: [this.sentReferral.referral.additionalNeedsInformation || 'N/A'],
        changeLink:
          this.userType === 'probation-practitioner' && !this.hasApprovedActionPlan
            ? `/probation-practitioner/referrals/${this.sentReferral.id}/update-additional-information`
            : undefined,
      },
      {
        key: 'Other mobility, disability or accessibility needs',
        lines: [this.sentReferral.referral.accessibilityNeeds || 'N/A'],
        changeLink:
          this.userType === 'probation-practitioner'
            ? `/probation-practitioner/referrals/${this.sentReferral.id}/update-accessibility-needs`
            : undefined,
      },
      {
        key: 'Interpreter required',
        lines: [this.sentReferral.referral.needsInterpreter ? 'Yes' : 'No'],
        changeLink:
          this.userType === 'probation-practitioner'
            ? `/probation-practitioner/referrals/${this.sentReferral.id}/interpreter-needs`
            : undefined,
      },
      { key: 'Interpreter language', lines: [this.sentReferral.referral.interpreterLanguage || 'N/A'] },
      {
        key: 'Primary language',
        lines: [this.sentReferral.referral.serviceUser.preferredLanguage || 'N/A'],
      },
      {
        key: 'Caring or employment responsibilities',
        lines: [this.sentReferral.referral.hasAdditionalResponsibilities ? 'Yes' : 'No'],
        changeLink:
          this.userType === 'probation-practitioner'
            ? `/probation-practitioner/referrals/${this.sentReferral.id}/employment-responsibilities`
            : undefined,
      },
      {
        key: `Provide details of when ${this.sentReferral.referral.serviceUser.firstName} will not be able to attend sessions`,
        lines: [this.sentReferral.referral.whenUnavailable || 'N/A'],
      },
    ]
  }

  private getPrisonName(prisonId: string | null): string {
    return this.prisons.find(prison => prison.prisonId === prisonId)?.prisonName || ''
  }
}

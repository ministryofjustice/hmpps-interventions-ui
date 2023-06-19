import SentReferral from '../../models/sentReferral'
import DeliusUser from '../../models/delius/deliusUser'
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
import DeliusConviction from '../../models/delius/deliusConviction'
import SentencePresenter from '../makeAReferral/relevant-sentence/sentencePresenter'
import { SupplementaryRiskInformation } from '../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import { ExpandedDeliusServiceUser } from '../../models/delius/deliusServiceUser'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import RoshPanelPresenter from './roshPanelPresenter'
import { DeliusOffenderManager } from '../../models/delius/deliusOffenderManager'
import DateUtils from '../../utils/dateUtils'
import Prison from '../../models/prisonRegister/prison'
import ArnRiskSummaryView from '../makeAReferral/risk-information/oasys/arnRiskSummaryView'

export default class ShowReferralPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  roshPanelPresenter: RoshPanelPresenter

  supplementaryRiskInformationView: ArnRiskSummaryView

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly intervention: Intervention,
    private readonly conviction: DeliusConviction,
    readonly riskInformation: SupplementaryRiskInformation,
    private readonly sentBy: DeliusUser,
    private readonly prisons: Prison[],
    private readonly assignee: AuthUserDetails | null,
    private readonly assignEmailError: FormValidationError | null,
    readonly userType: 'service-provider' | 'probation-practitioner',
    readonly canAssignReferral: boolean,
    private readonly deliusServiceUser: ExpandedDeliusServiceUser,
    readonly riskSummary: RiskSummary | null,
    private readonly responsibleOfficer: DeliusOffenderManager | null,
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
    return `${this.serviceUserNames}'s person details`
  }

  get interventionHeading(): string {
    return `${this.intervention.contractType.name} service`
  }

  get probationPractitionerDetailsHeading(): string {
    return `${this.serviceUserNames}'s probation practitioner`
  }

  get serviceUserLocationDetailsHeading(): string {
    if (this.sentReferral.referral.personCurrentLocationType === 'COMMUNITY')
      return `${this.serviceUserNames}'s location`
    return `${this.serviceUserNames}'s location and expected release date`
  }

  get serviceRiskAndNeedsDetailsHeading(): string {
    return `${this.serviceUserNames}'s risk information`
  }

  get responsibleOfficerDetailsHeading(): string {
    return `${this.serviceUserNames}'s responsible officer details`
  }

  get riskInformationHeading(): string {
    return `${this.serviceUserNames}'s risk Information`
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

  get assignedCaseworkerFullName(): string | null {
    return this.referralAssigned ? authUserFullName(this.assignee!) : null
  }

  get assignedCaseworkerEmail(): string | null {
    return this.referralAssigned ? `${this.assignee!.email}` : null
  }

  readonly probationPractitionerDetails: SummaryListItem[] = [
    { key: 'Name', lines: [`${this.sentBy.firstName} ${this.sentBy.surname}`] },
    { key: 'Email address', lines: [this.sentBy.email ?? ''] },
    { key: 'Probation Office', lines: [this.sentReferral.referral.ppProbationOffice ?? ''] },
  ]

  get responsibleOfficersDetails(): SummaryListItem[] {
    if (this.responsibleOfficer === null) return []

    const { staff, team } = this.responsibleOfficer
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
        lines: [
          staff?.email || 'Not found - email notifications for this referral will be sent to the referring officer',
        ],
        key: 'Email address',
      },
      {
        key: 'Team phone',
        lines: [team?.telephone || 'Not found'],
      },
      {
        key: 'Team email address',
        lines: [team?.emailAddress || 'Not found'],
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
        key: 'Date to be completed by',
        lines: [
          this.sentReferral.referral.completionDeadline
            ? DateUtils.formattedDate(this.sentReferral.referral.completionDeadline)
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

  get serviceUserDetails(): SummaryListItem[] {
    return new ServiceUserDetailsPresenter(
      this.sentReferral.referral.serviceUser,
      this.deliusServiceUser,
      this.prisons,
      this.sentReferral.id,
      this.sentReferral.referral.personCurrentLocationType,
      this.sentReferral.referral.personCustodyPrisonId,
      this.sentReferral.referral.expectedReleaseDate,
      this.sentReferral.referral.expectedReleaseDateMissingReason
    ).summary
  }

  get serviceUserLocationDetails(): SummaryListItem[] {
    const { personCurrentLocationType } = this.sentReferral.referral

    if (config.featureFlags.custodyLocationEnabled) {
      if (personCurrentLocationType === 'CUSTODY') {
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
            lines: [this.sentReferral.referral.personCustodyPrisonId ? 'RESOLVE PRISONNAME' /* prisonName */ : ''],
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

  riskSectionSummary(): SummaryListItem[] {
    const supplementaryRiskInformation = this.supplementaryRiskInformationView.supplementaryRiskInformationArgs
    if (this.riskInformation.redactedRisk) {
      return [
        {
          key: 'Who is at risk',
          lines: [supplementaryRiskInformation.summary.whoIsAtRisk.text || ''],
        },
        {
          key: 'What is the nature of the risk',
          lines: [supplementaryRiskInformation.summary.natureOfRisk.text || ''],
        },
        {
          key: 'When is the risk likely to be greatest',
          lines: [supplementaryRiskInformation.summary.riskImminence.text || ''],
        },
        {
          key: 'Concerns in relation to self-harm',
          lines: [
            supplementaryRiskInformation.riskToSelf.selfHarm.text || '',
            supplementaryRiskInformation.riskToSelf.selfHarm.label.text || '',
          ],
        },
        {
          key: 'Concerns in relation to suicide',
          lines: [
            supplementaryRiskInformation.riskToSelf.suicide.text || '',
            supplementaryRiskInformation.riskToSelf.suicide.label
              ? supplementaryRiskInformation.riskToSelf.suicide.label.text || ''
              : '',
          ],
        },
        {
          key: 'Concerns in relation to coping in a hostel setting',
          lines: [
            supplementaryRiskInformation.riskToSelf.hostelSetting.text || '',
            supplementaryRiskInformation.riskToSelf.hostelSetting.label
              ? supplementaryRiskInformation.riskToSelf.hostelSetting.label.text || ''
              : '',
          ],
        },
        {
          key: 'Concerns in relation to vulnerability',
          lines: [
            supplementaryRiskInformation.riskToSelf.vulnerability.text || '',
            supplementaryRiskInformation.riskToSelf.vulnerability.label
              ? supplementaryRiskInformation.riskToSelf.vulnerability.label.text || ''
              : '',
          ],
        },
        {
          key: 'Additional information',
          lines: [
            supplementaryRiskInformation.riskToSelf.vulnerability.text || '',
            supplementaryRiskInformation.riskToSelf.vulnerability.label
              ? supplementaryRiskInformation.riskToSelf.vulnerability.label.text || ''
              : '',
          ],
        },
      ]
    }
    return [
      {
        key: 'Additional risk information',
        lines: [supplementaryRiskInformation.additionalRiskInformation.text || ''],
      },
    ]
  }
}

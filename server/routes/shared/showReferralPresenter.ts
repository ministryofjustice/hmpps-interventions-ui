import moment from 'moment-timezone'
import SentReferral from '../../models/sentReferral'
import { RamDeliusUser } from '../../models/delius/deliusUser'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
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

  readonly crnDescription = `${this.sentReferral.referral.serviceUser?.firstName} ${this.sentReferral.referral.serviceUser?.lastName} (CRN: ${this.sentReferral.referral.serviceUser?.crn})`

  get serviceUserNames(): string {
    return `${utils.convertToTitleCase(
      `${this.sentReferral.referral.serviceUser.firstName} ${this.sentReferral.referral.serviceUser.lastName}`
    )}`
  }

  get serviceUserDetailsHeading(): string {
    return `${this.serviceUserNames}'s Personal details`
  }

  get serviceUserNeedsHeading(): string {
    return `${this.serviceUserNames}'s needs and requirements`
  }

  get interventionHeading(): string {
    return `${this.intervention.contractType.name} service`
  }

  get probationPractitionerDetailsHeading(): string {
    return `${this.serviceUserNames}'s probation practitioner`
  }

  get mainPointOfContactDetailsHeading(): string {
    return 'Main point of contact details (until probation practitioner is allocated)'
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

  get backupContactDetailsHeading(): string {
    return `Back-up contact for the referral`
  }

  get riskInformationHeading(): string {
    return `${this.serviceUserNames}'s risk information`
  }

  get contactDetailsHeading(): string {
    return `${this.serviceUserNames}'s Address and contact details`
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

  get checkIfReferralTypeIsSet(): boolean {
    return this.sentReferral.referral.personCurrentLocationType !== null
  }

  get isServiceProvider(): boolean {
    return this.userType === 'service-provider'
  }

  get assignedCaseworkerFullName(): string | null {
    return this.referralAssigned ? authUserFullName(this.assignee!) : null
  }

  get assignedCaseworkerEmail(): string | null {
    return this.referralAssigned ? `${this.assignee!.email}` : null
  }

  get isCustodyWithNoResponsibleOfficerDetails(): boolean {
    return (
      this.isCustodyReferral &&
      this.sentReferral.referral.ppName === null &&
      this.sentReferral.referral.ndeliusPPName === null &&
      this.sentReferral.referral.isReferralReleasingIn12Weeks === null
    )
  }

  get checkIfUnAllocatedCOM(): boolean {
    return this.sentReferral.referral.isReferralReleasingIn12Weeks !== null
  }

  get probationPractitionerDetailsForCommunity(): SummaryListItem[] {
    const officer = this.deliusResponsibleOfficer?.communityManager
    const probationPractitionerDetails: SummaryListItem[] = []
    if (this.sentReferral.referral.ppName || this.sentReferral.referral.ndeliusPPName) {
      probationPractitionerDetails.push(
        {
          key: 'Name',
          lines: [this.sentReferral.referral.ppName || this.sentReferral.referral.ndeliusPPName || 'Not found'],
        },
        { key: 'Email address', lines: [this.deriveEmailAddress] }
      )
      if (this.userType === 'service-provider') {
        probationPractitionerDetails.push({
          key: 'Phone number',
          lines: [officer?.telephoneNumber || 'Not found'],
        })
      }
      probationPractitionerDetails.push({
        key:
          this.sentReferral.referral.ppProbationOffice !== null && this.sentReferral.referral.ppProbationOffice !== ''
            ? 'Probation Office'
            : 'PDU (Probation Delivery Unit)',
        lines: [
          this.sentReferral.referral.ppProbationOffice !== null && this.sentReferral.referral.ppProbationOffice !== ''
            ? this.sentReferral.referral.ppProbationOffice
            : this.sentReferral.referral.ppPdu || this.sentReferral.referral.ndeliusPDU || '',
        ],
      })
      if (this.userType === 'service-provider') {
        probationPractitionerDetails.push({
          key: 'Team phone number',
          lines: [officer?.team?.telephoneNumber || 'Not found'],
        })
      }

      return probationPractitionerDetails
    }
    probationPractitionerDetails.push(
      {
        key: 'Name',
        lines: [`${officer?.name?.forename || ''} ${officer?.name?.surname || ''}`.trim() || 'Not found'],
      },
      { key: 'Email address', lines: [officer?.email || 'Not found'] }
    )
    if (this.userType === 'service-provider') {
      probationPractitionerDetails.push({
        key: 'Phone number',
        lines: [officer?.telephoneNumber || 'Not found'],
      })
    }
    probationPractitionerDetails.push({
      key: 'PDU (Probation Delivery Unit)',
      lines: [`${officer?.pdu.code || ''} ${officer?.pdu.description || ''}`.trim() || 'Not found'],
    })
    if (this.userType === 'service-provider') {
      probationPractitionerDetails.push({
        key: 'Team phone number',
        lines: [officer?.team?.telephoneNumber || 'Not found'],
      })
    }
    return probationPractitionerDetails
  }

  get mainPointOfContactDetailsSummary(): SummaryListItem[] {
    const probationPractitionerDetails: SummaryListItem[] = []
    probationPractitionerDetails.push(
      {
        key: 'Name',
        lines: [this.sentReferral.referral.ppName || 'Not found'],
      },
      {
        key: 'Role / job title',
        lines: [this.sentReferral.referral.roleOrJobTitle || 'Not found'],
      },
      { key: 'Email address', lines: [this.deriveEmailAddress] },
      this.establishmentOrProbationOffice
    )
    return probationPractitionerDetails
  }

  private get establishmentOrProbationOffice(): SummaryListItem {
    if (this.sentReferral.referral.ppEstablishment !== null && this.sentReferral.referral.ppEstablishment !== '') {
      return {
        key: 'Establishment',
        lines: [this.getPrisonName(this.sentReferral.referral.ppEstablishment)],
      }
    }
    if (this.sentReferral.referral.ppProbationOffice !== null && this.sentReferral.referral.ppProbationOffice !== '') {
      return {
        key: 'Probation office',
        lines: [this.sentReferral.referral.ppProbationOffice],
      }
    }
    return {
      key: 'Establishment/Probation office',
      lines: ['Not provided'],
    }
  }

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

    const responsibleOfficerDetails: SummaryListItem[] = []

    const officer = this.deliusResponsibleOfficer.communityManager
    responsibleOfficerDetails.push({
      key: 'Name',
      lines: [`${officer?.name?.forename || ''} ${officer?.name?.surname || ''}`.trim() || 'Not found'],
    })
    if (this.userType === 'service-provider') {
      responsibleOfficerDetails.push({
        key: 'Phone',
        lines: [officer?.telephoneNumber || 'Not found'],
      })
    }
    responsibleOfficerDetails.push({
      lines: [
        officer?.email || 'Not found - email notifications for this referral will be sent to the referring officer',
      ],
      key: 'Email address',
    })
    if (this.userType === 'service-provider') {
      responsibleOfficerDetails.push({
        key: 'Team phone',
        lines: [officer?.team?.telephoneNumber || 'Not found'],
      })
    }
    responsibleOfficerDetails.push({
      key: 'Team email address',
      lines: [officer?.team?.email || 'Not found'],
    })
    return responsibleOfficerDetails
  }

  get backupContactDetails(): SummaryListItem[] {
    if (this.sentBy === null || this.deliusResponsibleOfficer === null || !this.isRoAndSenderNotTheSamePerson) return []

    const backupContactDetails: SummaryListItem[] = []
    const backupUser = this.sentBy
    backupContactDetails.push({
      key: 'Referring officer name',
      lines: [`${backupUser?.name.forename || ''} ${backupUser?.name.surname || ''}`.trim() || 'Not found'],
    })
    backupContactDetails.push({
      key: 'Email address',
      lines: [backupUser?.email || 'Not found'],
    })

    return backupContactDetails
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
        key: 'Maximum number of enforceable days',
        lines: [String(this.sentReferral.referral.maximumEnforceableDays)],
        changeLink:
          this.userType === 'probation-practitioner'
            ? `/probation-practitioner/referrals/${this.sentReferral.id}/update-maximum-enforceable-days`
            : undefined,
      },
      {
        key: 'Date intervention to be completed by',
        lines: [
          this.sentReferral.referral.completionDeadline
            ? moment(this.sentReferral.referral.completionDeadline).format('D MMM YYYY')
            : '',
        ],
        changeLink:
          this.userType === 'probation-practitioner'
            ? `/referrals/${this.sentReferral.id}/completion-deadline`
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
    if (personCurrentLocationType === 'CUSTODY') {
      const currentPrisonName = this.getPrisonName(this.sentReferral.referral.personCustodyPrisonId)
      const expectedReleaseInfo: string =
        this.sentReferral.referral.expectedReleaseDate !== null && this.sentReferral.referral.expectedReleaseDate !== ''
          ? moment(this.sentReferral.referral.expectedReleaseDate).format('D MMM YYYY')
          : this.sentReferral.referral.expectedReleaseDateMissingReason!
      const items: SummaryListItem[] = []
      items.push({
        key: 'Location at time of referral',
        lines: [this.sentReferral.referral.personCustodyPrisonId ? currentPrisonName : ''],
      })
      if (
        this.sentReferral.referral.isReferralReleasingIn12Weeks !== null &&
        !this.sentReferral.referral.isReferralReleasingIn12Weeks
      ) {
        return items
      }
      items.push({
        key: 'Expected release date',
        lines: [expectedReleaseInfo],
      })

      return items
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

  get isRoAndSenderNotTheSamePerson(): boolean {
    return this.getRoName() !== this.getSenderName()
  }

  private getRoName(): string {
    const officer = this.deliusResponsibleOfficer?.communityManager
    const roName = `${officer?.name?.forename || ''} ${officer?.name?.surname || ''}`.trim()
    return this.sentReferral.referral.ppName ? this.sentReferral.referral.ppName : roName
  }

  private getSenderName(): string {
    return `${this.sentBy?.name.forename || ''} ${this.sentBy?.name.surname || ''}`.trim()
  }
}

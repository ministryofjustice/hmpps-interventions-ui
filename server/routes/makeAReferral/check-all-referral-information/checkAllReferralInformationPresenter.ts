import moment from 'moment-timezone'
import DraftReferral, { CurrentLocationType } from '../../../models/draftReferral'
import { ListStyle, SummaryListItem } from '../../../utils/summaryList'
import ServiceUserDetailsPresenter from '../service-user-details/serviceUserDetailsPresenter'
import NeedsAndRequirementsPresenter from '../needs-and-requirements/needsAndRequirementsPresenter'
import ComplexityLevelPresenter from '../service-category/complexity-level/complexityLevelPresenter'
import DesiredOutcomesPresenter from '../service-category/desired-outcomes/desiredOutcomesPresenter'
import utils from '../../../utils/utils'
import DraftReferralDecorator from '../../../decorators/draftReferralDecorator'
import Intervention from '../../../models/intervention'
import InterventionDecorator from '../../../decorators/interventionDecorator'
import { DeliusConviction } from '../../../models/delius/deliusConviction'
import SentencePresenter from '../relevant-sentence/sentencePresenter'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'
import DateUtils from '../../../utils/dateUtils'
import { DraftOasysRiskInformation } from '../../../models/draftOasysRiskInformation'
import PrisonAndSecuredChildAgency from '../../../models/prisonAndSecureChildAgency'
import LoggedInUser from '../../../models/loggedInUser'
import Prisoner from '../../../models/prisonerOffenderSearch/prisoner'

export default class CheckAllReferralInformationPresenter {
  readonly backLinkUrl: string

  constructor(
    private readonly referral: DraftReferral,
    private readonly intervention: Intervention,
    private readonly loggedInUser: LoggedInUser,
    private readonly conviction: DeliusConviction,
    private readonly deliusServiceUser: DeliusServiceUser,
    private readonly prisonAndSecureChildAgency: PrisonAndSecuredChildAgency[],
    private readonly prisonerDetails: Prisoner,
    private readonly editedOasysRiskInformation: DraftOasysRiskInformation | null = null
  ) {
    this.backLinkUrl = `/referrals/${this.referral.id}/form`
  }

  get serviceUserDetailsSection(): { title: string; summary: SummaryListItem[] } {
    return {
      title: `${this.serviceUserNameForServiceCategory}’s personal details`,
      summary: new ServiceUserDetailsPresenter(
        this.referral.serviceUser,
        this.deliusServiceUser,
        this.referral.id,
        this.referral?.personCurrentLocationType,
        this.referral?.personCustodyPrisonId,
        this.referral?.expectedReleaseDate,
        this.referral?.expectedReleaseDateMissingReason
      ).checkAnswersSummary,
    }
  }

  get lastKnownAddressAndContactDetails(): { title: string; summary: SummaryListItem[] } {
    return {
      title: `${this.serviceUserNameForServiceCategory}’s last known address and contact details`,
      summary: new ServiceUserDetailsPresenter(
        this.referral.serviceUser,
        this.deliusServiceUser,
        this.referral.id,
        this.referral?.personCurrentLocationType,
        this.referral?.personCustodyPrisonId,
        this.referral?.expectedReleaseDate,
        this.referral?.expectedReleaseDateMissingReason
      ).contactDetailsForReferralDetailsSummary,
    }
  }

  get personalDetails(): { title: string; summary: SummaryListItem[] } {
    return {
      title: `${this.serviceUserNameForServiceCategory}’s last known address and contact details`,
      summary: new ServiceUserDetailsPresenter(
        this.referral.serviceUser,
        this.deliusServiceUser,
        this.referral.id,
        this.referral?.personCurrentLocationType,
        this.referral?.personCustodyPrisonId,
        this.referral?.expectedReleaseDate,
        this.referral?.expectedReleaseDateMissingReason
      ).contactDetailsForReferralDetailsSummary,
    }
  }

  get personalDetailSummary(): { title: string; summary: SummaryListItem[] } {
    return {
      title: `${this.serviceUserNameForServiceCategory}’s personal details`,
      summary: new ServiceUserDetailsPresenter(
        this.referral.serviceUser,
        this.deliusServiceUser,
        this.referral.id,
        this.referral?.personCurrentLocationType,
        this.referral?.personCustodyPrisonId,
        this.referral?.expectedReleaseDate,
        this.referral?.expectedReleaseDateMissingReason
      ).personalDetailsForReferralDetailsSummary,
    }
  }

  private get checkIfProbationPractitionerDetailsExist(): boolean {
    return (
      this.referral.ndeliusPPName !== null ||
      this.referral.ndeliusPPEmailAddress !== null ||
      this.referral.ndeliusPDU !== null ||
      this.referral.ppName !== null ||
      this.referral.ppEmailAddress !== null ||
      this.referral.ppPdu !== null ||
      this.referral.ppProbationOffice !== null
    )
  }

  get checkIfUnAllocatedCOM(): boolean {
    return this.referral.isReferralReleasingIn12Weeks !== null
  }

  get checkIfExpectedReleaseDateIsAvailable(): boolean {
    return this.referral.expectedReleaseDate !== null || this.referral.expectedReleaseDateMissingReason !== null
  }

  get isCommunity(): boolean {
    return this.referral.personCurrentLocationType === CurrentLocationType.community
  }

  get identityDetails(): SummaryListItem[] {
    const summaryListItem: SummaryListItem[] = [
      { key: 'First name', lines: [this.referral.serviceUser.firstName ?? ''] },
      { key: 'Last name(s)', lines: [this.referral.serviceUser.lastName ?? ''] },
      {
        key: 'Date of birth',
        lines: [this.dateOfBirthWithShortMonth ? `${this.dateOfBirthWithShortMonth} (${this.age} years old)` : ''],
      },
      {
        key: 'CRN',
        lines: [this.referral.serviceUser.crn],
      },
    ]
    if (!this.isCommunity) {
      summaryListItem.push({
        key: 'Prison number',
        lines: [this.prisonerDetails.prisonerNumber ?? ''],
      })
    }
    return summaryListItem
  }

  get probationPractitionerDetailSection(): { title: string; summary: SummaryListItem[] } | null {
    if (!this.checkIfProbationPractitionerDetailsExist) {
      return null
    }
    return {
      title: `Probation practitioner details`,
      summary: [
        {
          key: 'Name',
          lines: [this.referral.ppName || this.referral.ndeliusPPName || 'Not found'],
          changeLink: `/referrals/${this.referral.id}/update-probation-practitioner-name?amendPPDetails=true`,
        },
        {
          key: 'Email address',
          lines: [this.deriveEmailAddress],
          changeLink: `/referrals/${this.referral.id}/update-probation-practitioner-email-address?amendPPDetails=true`,
        },
        {
          key: 'Phone number',
          lines: [this.referral.ppPhoneNumber || this.referral.ndeliusPhoneNumber || 'Not provided'],
          changeLink: `/referrals/${this.referral.id}/update-probation-practitioner-phone-number?amendPPDetails=true`,
        },
        ...this.derivePduOrProbationOffice('Probation office', 'PDU (Probation Delivery Unit)'),
        {
          key: 'Team phone number',
          lines: [this.referral.ppTeamPhoneNumber || this.referral.ndeliusTeamPhoneNumber || 'Not provided'],
          changeLink: `/referrals/${this.referral.id}/update-probation-practitioner-team-phone-number?amendPPDetails=true`,
        },
      ],
    }
  }

  private derivePduOrProbationOffice(probationOfficeHeading: string, pduHeading: string): SummaryListItem[] {
    if (this.referral.isReferralReleasingIn12Weeks !== null) {
      if (this.referral.expectedProbationOfficeUnKnownReason !== null) {
        return [
          {
            key: 'Expected probation office',
            lines: ['---'],
            changeLink: `/referrals/${this.referral.id}/expected-probation-office?amendPPDetails=true`,
          },
          {
            key: 'Reason why expected probation office is not known',
            lines: [this.referral.expectedProbationOfficeUnKnownReason],
            changeLink: `/referrals/${this.referral.id}/expected-probation-office-unknown?amendPPDetails=true`,
          },
        ]
      }
      return [
        {
          key: probationOfficeHeading,
          lines: [this.referral.expectedProbationOffice || '---'],
          changeLink: `/referrals/${this.referral.id}/expected-probation-office?amendPPDetails=true`,
        },
      ]
    }
    if (this.referral.expectedProbationOffice || this.referral.ppProbationOffice) {
      return [
        {
          key: probationOfficeHeading,
          lines: [this.referral.expectedProbationOffice || this.referral.ppProbationOffice || 'Not provided'],
          changeLink: this.checkIfUnAllocatedCOM
            ? `/referrals/${this.referral.id}/expected-probation-office?amendPPDetails=true`
            : `/referrals/${this.referral.id}/update-probation-practitioner-office?amendPPDetails=true`,
        },
      ]
    }
    return [
      {
        key: pduHeading,
        lines: [this.referral.ppPdu || this.referral.ndeliusPDU || '---'],
        changeLink: `/referrals/${this.referral.id}/update-probation-practitioner-pdu?amendPPDetails=true`,
      },
    ]
  }

  get mainPointOfContactDetailsSection(): { title: string; summary: SummaryListItem[] } | null {
    if (!this.checkIfUnAllocatedCOM) {
      return null
    }
    return {
      title: `Main point of contact details`,
      summary: [
        {
          key: 'Name',
          lines: [this.referral.ppName || this.referral.ndeliusPPName || 'Not found'],
          changeLink: `/referrals/${this.referral.id}/confirm-main-point-of-contact?amendPPDetails=true`,
        },
        {
          key: 'Role / job title',
          lines: [this.referral.roleOrJobTitle || 'Not found'],
          changeLink: `/referrals/${this.referral.id}/confirm-main-point-of-contact?amendPPDetails=true`,
        },
        {
          key: 'Email address',
          lines: [this.deriveEmailAddress],
          changeLink: `/referrals/${this.referral.id}/confirm-main-point-of-contact?amendPPDetails=true`,
        },
        this.determineElementForMainPointOfContacts,
      ],
    }
  }

  private get determineElementForMainPointOfContacts(): SummaryListItem {
    if (this.referral.isReferralReleasingIn12Weeks) {
      return {
        key: 'Reason why referral is being made before probation practitioner allocated',
        lines: [this.referral.reasonForReferralCreationBeforeAllocation || ''],
        changeLink: `/referrals/${this.referral.id}/reason-for-referral-before-allocation?amendPPDetails=true`,
      }
    }
    return this.establishmentOrProbationOffice
  }

  get backupContactDetails(): { title: string; summary: SummaryListItem[] } | null {
    if (
      this.loggedInUser.username.toUpperCase() === this.referral.ndeliusPPName?.toUpperCase() ||
      this.loggedInUser.username.toUpperCase() === this.referral.ppName?.toUpperCase()
    )
      return null

    const backupContactDetails: SummaryListItem[] = []
    backupContactDetails.push({
      key: 'Referring officer',
      lines: [this.loggedInUser.username || 'Not found'],
    })
    backupContactDetails.push({
      key: 'Email address',
      lines: [this.loggedInUser.email || 'Not found'],
    })

    return {
      title: `Back up contact for the referral`,
      summary: backupContactDetails,
    }
  }

  private get establishmentOrProbationOffice(): SummaryListItem {
    if (this.referral.ppEstablishment) {
      return {
        key: 'Prison establishment',
        lines: [this.prisonName(this.referral.ppEstablishment)],
        changeLink: `/referrals/${this.referral.id}/confirm-main-point-of-contact?amendPPDetails=true`,
      }
    }
    if (this.referral.ppProbationOffice) {
      return {
        key: 'Probation office',
        lines: [this.referral.ppProbationOffice],
        changeLink: `/referrals/${this.referral.id}/confirm-main-point-of-contact?amendPPDetails=true`,
      }
    }
    return {
      key: 'Establishment/Probation office',
      lines: ['Not provided'],
      changeLink: `/referrals/${this.referral.id}/confirm-main-point-of-contact?amendPPDetails=true`,
    }
  }

  get currentLocationAndReleaseDetailsSection(): { title: string; summary: SummaryListItem[] } | null {
    const expectedReleaseInfo: string =
      this.referral.expectedReleaseDate !== null
        ? moment(this.referral.expectedReleaseDate!).format('D MMM YYYY [(]ddd[)]')
        : '---'

    const currentLocationAndReleaseDetails: SummaryListItem[] = [
      {
        key: 'Location at time of referral',
        lines: [this.prisonName(this.referral.personCustodyPrisonId)],
        changeLink: `/referrals/${this.referral.id}/submit-current-location?amendPPDetails=true`,
      },
      {
        key: 'Expected release date',
        lines: [expectedReleaseInfo],
        changeLink: `/referrals/${this.referral.id}/expected-release-date?amendPPDetails=true`,
      },
    ]

    if (this.referral.expectedReleaseDateMissingReason) {
      currentLocationAndReleaseDetails.push({
        key: 'Reason why expected release date is not known',
        lines: [this.referral.expectedReleaseDateMissingReason],
        changeLink: `/referrals/${this.referral.id}/expected-release-date-unknown?amendPPDetails=true`,
      })
    }
    currentLocationAndReleaseDetails.push(
      ...this.derivePduOrProbationOffice('Expected probation office', 'Expected PDU (Probation Delivery Unit)')
    )
    return {
      title: `${this.serviceUserNameForServiceCategory}’s current location and expected release details`,
      summary: currentLocationAndReleaseDetails,
    }
  }

  get communityCurrentLocationAndReleaseDetailsSection(): { title: string; summary: SummaryListItem[] } | null {
    const currentLocationAndReleaseDetails: SummaryListItem[] = [
      {
        key: 'Location at time of referral',
        lines: [`${utils.convertToProperCase(this.referral.personCurrentLocationType!)}`],
      },
      ...this.derivePduOrProbationOffice('Probation office', 'PDU (Probation Delivery Unit)'),
      {
        key: 'Release date',
        lines: [
          this.prisonerDetails !== null &&
          this.prisonerDetails.releaseDate !== undefined &&
          this.prisonerDetails.releaseDate !== null
            ? moment(this.prisonerDetails.releaseDate).format('D MMM YYYY [(]ddd[)]')
            : '---',
        ],
      },
    ]
    return {
      title: `${this.serviceUserNameForServiceCategory}’s current location and release details`,
      summary: currentLocationAndReleaseDetails,
    }
  }

  get locationSection(): { title: string; summary: SummaryListItem[] } | null {
    if (this.referral.isReferralReleasingIn12Weeks === null) {
      return null
    }
    return {
      title: `${this.serviceUserNameForServiceCategory}’s location`,
      summary: [
        {
          key: 'Location at time of referral',
          lines: [this.prisonName(this.referral.personCustodyPrisonId)],
          changeLink: `/referrals/${this.referral.id}/submit-current-location?amendPPDetails=true`,
        },
      ],
    }
  }

  private prisonName(prisonId: string | null): string {
    if (prisonId === null) {
      return ''
    }

    const matchedPerson = this.prisonAndSecureChildAgency.find(prison => prison.id === prisonId)
    return matchedPerson ? matchedPerson.description : ''
  }

  get deriveEmailAddress(): string {
    if (this.referral.ppEmailAddress) {
      return this.referral.ppEmailAddress
    }
    if (this.referral.ndeliusPPEmailAddress && this.referral.ndeliusPPEmailAddress.toLowerCase() !== 'undefined') {
      return this.referral.ndeliusPPEmailAddress
    }
    return 'Not provided'
  }

  get riskSection(): { title: string; summary: SummaryListItem[] } {
    if (this.editedOasysRiskInformation) {
      return {
        title: `${this.serviceUserNameForServiceCategory}’s OAsys risk information`,
        summary: [
          {
            key: 'Who is at risk',
            lines: [this.editedOasysRiskInformation.riskSummaryWhoIsAtRisk || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Nature of risk',
            lines: [this.editedOasysRiskInformation.riskSummaryNatureOfRisk || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'When risk likely to be greatest',
            lines: [this.editedOasysRiskInformation.riskSummaryRiskImminence || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Concerns relating to self harm',
            lines: [this.editedOasysRiskInformation.riskToSelfSelfHarm || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Concerns relating to suicide',
            lines: [this.editedOasysRiskInformation.riskToSelfSuicide || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Concerns relating to coping in a hotel setting',
            lines: [this.editedOasysRiskInformation.riskToSelfHostelSetting || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Concerns relating to vulnerability',
            lines: [this.editedOasysRiskInformation.riskToSelfVulnerability || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Additional risk information',
            lines: [this.editedOasysRiskInformation.additionalInformation || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
        ],
      }
    }
    return {
      title: `${this.serviceUserName}’s risk information`,
      summary: [
        {
          key: 'Additional risk information',
          lines: [this.referral.additionalRiskInformation ?? ''],
          changeLink: `/referrals/${this.referral.id}/risk-information`,
        },
      ],
    }
  }

  get needsAndRequirementsSection(): { title: string; summary: SummaryListItem[] } {
    const needsAndRequirementsPresenter = new NeedsAndRequirementsPresenter(this.referral)

    return {
      title: `${this.serviceUserNameForServiceCategory}’s needs and requirements`,
      summary: [
        {
          key: 'Identify needs',
          lines: [needsAndRequirementsPresenter.fields.additionalNeedsInformation],
          changeLink: `/referrals/${this.referral.id}/needs-and-requirements`,
        },
        {
          key: 'Mobility, disability or accessibility needs',
          lines: [needsAndRequirementsPresenter.fields.accessibilityNeeds],
          changeLink: `/referrals/${this.referral.id}/needs-and-requirements`,
        },
        {
          key: 'Interpreter required',
          lines: [this.referral.needsInterpreter ? 'Yes' : 'No'],
          changeLink: `/referrals/${this.referral.id}/needs-and-requirements`,
        },
        {
          key: 'Interpreter language',
          lines: [this.referral.interpreterLanguage || 'N/A'],
          changeLink: `/referrals/${this.referral.id}/needs-and-requirements`,
        },
        {
          key: 'Primary language',
          lines: [this.referral.serviceUser.preferredLanguage || 'N/A'],
        },
        {
          key: 'Caring or employment responsibilities',
          lines: this.conditionalValue(
            needsAndRequirementsPresenter.fields.hasAdditionalResponsibilities,
            needsAndRequirementsPresenter.fields.whenUnavailable
          ),
          changeLink: `/referrals/${this.referral.id}/needs-and-requirements`,
        },
      ],
    }
  }

  private conditionalValue(isSelected: boolean | null, dependentAnswerText: string) {
    if (isSelected) {
      return ['Yes', dependentAnswerText]
    }
    return ['No']
  }

  get referralDetailsSections(): { title: string; summary: SummaryListItem[] }[] {
    if (this.referral.serviceCategoryIds === null) {
      throw new Error('Service categories haven’t been selected')
    }

    return this.referral.serviceCategoryIds.map(serviceCategoryId => {
      const serviceCategory = this.intervention.serviceCategories.find(aCategory => aCategory.id === serviceCategoryId)

      if (serviceCategory === undefined) {
        throw new Error(`Couldn’t find service category with ID ${serviceCategoryId}`)
      }

      const complexityLevelPresenter = new ComplexityLevelPresenter(this.referral, serviceCategory)
      const checkedComplexityOption = complexityLevelPresenter.complexityDescriptions.find(val => val.checked)

      const desiredOutcomesPresenter = new DesiredOutcomesPresenter(this.referral, serviceCategory)
      const checkedDesiredOutcomesOptions = desiredOutcomesPresenter.desiredOutcomes.filter(val => val.checked)
      const { isCohortIntervention } = new InterventionDecorator(this.intervention)
      const summaries: SummaryListItem[] = []

      if (!isCohortIntervention) {
        summaries.push({
          key: 'Reason for referral and further information for the service provider',
          lines: [this.determineFurtherInformation(this.referral)],
          changeLink: `/referrals/${this.referral.id}/reason-for-referral?amendPPDetails=true`,
        })
      }
      summaries.push(
        {
          key: 'Complexity level',
          lines: [checkedComplexityOption?.title ?? '', '', checkedComplexityOption?.hint ?? ''],
          changeLink: `/referrals/${this.referral.id}/service-category/${serviceCategoryId}/complexity-level`,
        },
        {
          key: 'Desired outcomes',
          lines: checkedDesiredOutcomesOptions.map(option => option.text),
          listStyle: checkedDesiredOutcomesOptions.length > 1 ? ListStyle.bulleted : ListStyle.noMarkers,
          changeLink: `/referrals/${this.referral.id}/service-category/${serviceCategoryId}/desired-outcomes`,
        }
      )
      return {
        title: isCohortIntervention
          ? `${utils.convertToProperCase(serviceCategory.name)} service`
          : `${utils.convertToProperCase(serviceCategory.name)} intervention`,
        summary: summaries,
      }
    })
  }

  get serviceCategoriesSummary(): { title: string; summary: SummaryListItem[] } | null {
    if (!new InterventionDecorator(this.intervention).isCohortIntervention) {
      return null
    }

    const serviceCategories = new DraftReferralDecorator(this.referral).referralServiceCategories(
      this.intervention.serviceCategories
    )

    return {
      title: `${utils.convertToProperCase(this.intervention.contractType.name)} intervention`,
      summary: [
        {
          key: 'Reason for referral and further information for the service provider',
          lines: [this.determineFurtherInformation(this.referral)],
          changeLink: `/referrals/${this.referral.id}/reason-for-referral?amendPPDetails=true`,
        },
        {
          key: 'Selected services',
          lines: serviceCategories.map(serviceCategory => utils.convertToProperCase(serviceCategory.name)),
          listStyle: ListStyle.noMarkers,
          changeLink: `/referrals/${this.referral.id}/service-categories`,
        },
      ],
    }
  }

  get sentenceInformationSummary(): { title: string; summary: SummaryListItem[] } {
    const presenter = new SentencePresenter(this.conviction)
    const { completionDeadline } = new DraftReferralDecorator(this.referral)

    if (completionDeadline === null) {
      throw new Error('Trying to check answers with completion deadline not set')
    }

    return {
      title: 'Intervention details',
      summary: [
        { key: 'Intervention type', lines: [utils.convertToProperCase(this.intervention.contractType.name)] },
        {
          key: 'Sentence',
          lines: [presenter.category],
          changeLink: `/referrals/${this.referral.id}/relevant-sentence`,
        },
        {
          key: 'Subcategory',
          lines: [presenter.subcategory],
          changeLink: `/referrals/${this.referral.id}/relevant-sentence`,
        },
        {
          key: 'End of sentence date',
          lines: [presenter.endOfSentenceDate],
          changeLink: `/referrals/${this.referral.id}/relevant-sentence`,
        },
        {
          key: 'Maximum number of enforceable days',
          lines: [this.referral.maximumEnforceableDays ? this.referral.maximumEnforceableDays.toString() : ''],
          changeLink: `/referrals/${this.referral.id}/enforceable-days`,
        },
        {
          key: 'Date intervention to be completed by',
          lines: [DateUtils.formattedDate(completionDeadline, { month: 'short' })],
          changeLink: `/referrals/${this.referral.id}/completion-deadline`,
        },
      ],
    }
  }

  private determineFurtherInformation(referral: DraftReferral) {
    if (referral.reasonForReferral?.length) {
      return referral.reasonForReferral!
    }
    if (referral.furtherInformation?.length) {
      return referral.furtherInformation!
    }
    return 'None'
  }

  private get dateOfBirthWithShortMonth() {
    if (this.referral.serviceUser.dateOfBirth === null) {
      return ''
    }
    return DateUtils.formattedDate(this.referral.serviceUser.dateOfBirth, { month: 'short' })
  }

  private get age() {
    if (this.referral.serviceUser.dateOfBirth === null) {
      return ''
    }
    return DateUtils.age(this.referral.serviceUser.dateOfBirth)
  }

  private readonly serviceUserName = this.referral.serviceUser.firstName ?? ''

  readonly crnDescription = `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`

  private readonly serviceUserNameForServiceCategory =
    this.referral.serviceUser.firstName && this.referral.serviceUser.lastName
      ? [
          utils.convertToProperCase(this.referral.serviceUser.firstName),
          utils.convertToProperCase(this.referral.serviceUser.lastName),
        ].join(' ')
      : 'The person on probation'
}

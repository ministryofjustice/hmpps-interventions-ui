import DraftReferral from '../../../models/draftReferral'
import { ListStyle, SummaryListItem } from '../../../utils/summaryList'
import ServiceUserDetailsPresenter from '../service-user-details/serviceUserDetailsPresenter'
import NeedsAndRequirementsPresenter from '../needs-and-requirements/needsAndRequirementsPresenter'
import ComplexityLevelPresenter from '../service-category/complexity-level/complexityLevelPresenter'
import DesiredOutcomesPresenter from '../service-category/desired-outcomes/desiredOutcomesPresenter'
import utils from '../../../utils/utils'
import DraftReferralDecorator from '../../../decorators/draftReferralDecorator'
import Intervention from '../../../models/intervention'
import InterventionDecorator from '../../../decorators/interventionDecorator'
import DeliusConviction from '../../../models/delius/deliusConviction'
import SentencePresenter from '../relevant-sentence/sentencePresenter'
import { ExpandedDeliusServiceUser } from '../../../models/delius/deliusServiceUser'
import DateUtils from '../../../utils/dateUtils'
import { DraftOasysRiskInformation } from '../../../models/draftOasysRiskInformation'
import Prison from '../../../models/prisonRegister/prison'

export default class CheckAllReferralInformationPresenter {
  readonly backLinkUrl: string

  constructor(
    private readonly referral: DraftReferral,
    private readonly intervention: Intervention,
    private readonly conviction: DeliusConviction,
    private readonly deliusServiceUser: ExpandedDeliusServiceUser,
    private readonly prisons: Prison[],
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
        this.prisons,
        this.referral.id,
        this.referral?.personCurrentLocationType,
        this.referral?.personCustodyPrisonId,
        this.referral?.expectedReleaseDate,
        this.referral?.expectedReleaseDateMissingReason
      ).checkAnswersSummary,
    }
  }

  private checkIfProbationPractitionerDetailsExist(): boolean {
    return (
      this.referral.ndeliusPPName != null ||
      this.referral.ndeliusPPEmailAddress != null ||
      this.referral.ndeliusPDU != null ||
      this.referral.ppName != null ||
      this.referral.ppEmailAddress != null ||
      this.referral.ppPdu != null ||
      this.referral.ppProbationOffice != null
    )
  }

  get probationPractitionerDetailSection(): { title: string; summary: SummaryListItem[] } | null {
    if (!this.checkIfProbationPractitionerDetailsExist()) {
      return null
    }
    return {
      title: `Probation practitioner details`,
      summary: [
        {
          key: 'Name',
          lines: [this.referral.ppName || this.referral.ndeliusPPName || 'Not found'],
          changeLink: `/referrals/${this.referral.id}/confirm-probation-practitioner-details?amendPPDetails=true`,
        },
        {
          key: 'Email address',
          lines: [this.deriveEmailAddress],
          changeLink: `/referrals/${this.referral.id}/confirm-probation-practitioner-details?amendPPDetails=true`,
        },
        {
          key: 'PDU (Probation Delivery Unit)',
          lines: [this.referral.ppPdu || this.referral.ndeliusPDU || ''],
          changeLink: `/referrals/${this.referral.id}/confirm-probation-practitioner-details?amendPPDetails=true`,
        },
        {
          key: 'Probation office',
          lines: [this.referral.ppProbationOffice || 'Not provided'],
          changeLink: `/referrals/${this.referral.id}/confirm-probation-practitioner-details?amendPPDetails=true`,
        },
      ],
    }
  }

  get deriveEmailAddress(): string {
    if (this.referral.ppEmailAddress) {
      return this.referral.ppEmailAddress
    }
    if (this.referral.ndeliusPPEmailAddress && this.referral.ndeliusPPEmailAddress.toLowerCase() !== 'undefined') {
      return this.referral.ndeliusPPEmailAddress
    }
    return 'Not found'
  }

  get riskSection(): { title: string; summary: SummaryListItem[] } {
    if (this.editedOasysRiskInformation) {
      return {
        title: `OAsys risk information`,
        summary: [
          {
            key: 'Who is at risk',
            lines: [this.editedOasysRiskInformation.riskSummaryWhoIsAtRisk || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'What is the nature of the risk',
            lines: [this.editedOasysRiskInformation.riskSummaryNatureOfRisk || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'When is the risk likely to be greatest',
            lines: [this.editedOasysRiskInformation.riskSummaryRiskImminence || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Concerns in relation to self-harm',
            lines: [this.editedOasysRiskInformation.riskToSelfSelfHarm || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Concerns in relation to suicide',
            lines: [this.editedOasysRiskInformation.riskToSelfSuicide || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Concerns in relation to coping in a hostel setting',
            lines: [this.editedOasysRiskInformation.riskToSelfHostelSetting || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Concerns in relation to vulnerability',
            lines: [this.editedOasysRiskInformation.riskToSelfVulnerability || ''],
            changeLink: `/referrals/${this.referral.id}/edit-oasys-risk-information`,
          },
          {
            key: 'Additional information',
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
      title: `${this.serviceUserName}’s needs and requirements`,
      summary: [
        {
          key: needsAndRequirementsPresenter.text.additionalNeedsInformation.label,
          lines: [needsAndRequirementsPresenter.fields.additionalNeedsInformation],
          changeLink: `/referrals/${this.referral.id}/needs-and-requirements`,
        },
        {
          key: needsAndRequirementsPresenter.text.accessibilityNeeds.label,
          lines: [needsAndRequirementsPresenter.fields.accessibilityNeeds],
          changeLink: `/referrals/${this.referral.id}/needs-and-requirements`,
        },
        {
          key: needsAndRequirementsPresenter.text.needsInterpreter.label,
          lines: this.conditionalValue(
            needsAndRequirementsPresenter.fields.needsInterpreter,
            needsAndRequirementsPresenter.fields.interpreterLanguage
          ),
          changeLink: `/referrals/${this.referral.id}/needs-and-requirements`,
        },
        {
          key: needsAndRequirementsPresenter.text.hasAdditionalResponsibilities.label,
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

      return {
        title: `${utils.convertToProperCase(serviceCategory.name)} referral details`,
        summary: [
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
          },
        ],
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
      title: 'Service categories',
      summary: [
        {
          key: 'Selected service categories',
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
      title: 'Sentence Information',
      summary: [
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
          lines: [DateUtils.formattedDate(completionDeadline)],
          changeLink: `/referrals/${this.referral.id}/completion-deadline`,
        },
        {
          key: 'Further information for the service provider',
          lines: [this.referral.furtherInformation?.length ? this.referral.furtherInformation! : 'None'],
          changeLink: `/referrals/${this.referral.id}/further-information`,
        },
      ],
    }
  }

  private readonly serviceUserName = this.referral.serviceUser.firstName ?? ''

  private readonly serviceUserNameForServiceCategory =
    this.referral.serviceUser.firstName && this.referral.serviceUser.lastName
      ? [
          utils.convertToProperCase(this.referral.serviceUser.firstName),
          utils.convertToProperCase(this.referral.serviceUser.lastName),
        ].join(' ')
      : 'The person on probation'
}

import DraftReferral from '../../models/draftReferral'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'
import NeedsAndRequirementsPresenter from './needsAndRequirementsPresenter'
import ComplexityLevelPresenter from './complexityLevelPresenter'
import DesiredOutcomesPresenter from './desiredOutcomesPresenter'
import utils from '../../utils/utils'
import DraftReferralDecorator from '../../decorators/draftReferralDecorator'
import Intervention from '../../models/intervention'
import InterventionDecorator from '../../decorators/interventionDecorator'
import DeliusConviction from '../../models/delius/deliusConviction'
import SentencePresenter from './sentencePresenter'
import PresenterUtils from '../../utils/presenterUtils'

export default class CheckAnswersPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly intervention: Intervention,
    private readonly conviction: DeliusConviction
  ) {}

  get serviceUserDetailsSection(): { title: string; summary: SummaryListItem[] } {
    return {
      title: `${this.serviceUserName}’s personal details`,
      summary: new ServiceUserDetailsPresenter(this.referral.serviceUser).summary,
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
        },
        {
          key: needsAndRequirementsPresenter.text.accessibilityNeeds.label,
          lines: [needsAndRequirementsPresenter.fields.accessibilityNeeds],
        },
        {
          key: needsAndRequirementsPresenter.text.needsInterpreter.label,
          lines: [
            this.conditionalValue(
              needsAndRequirementsPresenter.fields.needsInterpreter,
              needsAndRequirementsPresenter.fields.interpreterLanguage
            ),
          ],
        },
        {
          key: needsAndRequirementsPresenter.text.hasAdditionalResponsibilities.label,
          lines: [
            this.conditionalValue(
              needsAndRequirementsPresenter.fields.hasAdditionalResponsibilities,
              needsAndRequirementsPresenter.fields.whenUnavailable
            ),
          ],
        },
      ],
    }
  }

  private conditionalValue(isSelected: boolean | null, dependentAnswerText: string) {
    if (isSelected) {
      return `Yes. ${dependentAnswerText}`
    }
    return 'No'
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
          },
          {
            key: 'Desired outcomes',
            lines: checkedDesiredOutcomesOptions.map(option => option.text),
            listStyle: ListStyle.bulleted,
          },
        ],
      }
    })
  }

  get serviceCategoriesSummary(): SummaryListItem[] | null {
    if (!new InterventionDecorator(this.intervention).isCohortIntervention) {
      return null
    }

    const serviceCategories = new DraftReferralDecorator(this.referral).referralServiceCategories(
      this.intervention.serviceCategories
    )

    return [
      {
        key: 'Selected service categories',
        lines: serviceCategories.map(serviceCategory => utils.convertToProperCase(serviceCategory.name)),
        listStyle: ListStyle.noMarkers,
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

  get completionDeadlineSection(): { title: string; summary: SummaryListItem[] } {
    const { completionDeadline } = new DraftReferralDecorator(this.referral)

    if (completionDeadline === null) {
      throw new Error('Trying to check answers with completion deadline not set')
    }

    return {
      title: `${this.intervention.contractType.name} completion date`,
      summary: [{ key: 'Date', lines: [PresenterUtils.govukFormattedDate(completionDeadline)] }],
    }
  }

  get enforceableDaysSummary(): SummaryListItem[] {
    const result = [
      {
        key: 'Are you using enforceable days?',
        lines: [this.referral.usingRarDays ? 'Yes' : 'No'],
      },
    ]

    if (this.referral.usingRarDays) {
      if (this.referral.maximumRarDays === null) {
        throw new Error('Trying to check answers for referral that uses RAR days, but without maximum RAR days set')
      }
      result.push({ key: 'Maximum number of enforceable days', lines: [this.referral.maximumRarDays.toString()] })
    }

    return result
  }

  private readonly serviceUserName = this.referral.serviceUser?.firstName ?? ''
}

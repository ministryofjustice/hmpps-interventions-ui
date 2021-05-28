import DraftReferral from '../../models/draftReferral'
import ServiceCategory from '../../models/serviceCategory'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'
import NeedsAndRequirementsPresenter from './needsAndRequirementsPresenter'
import ComplexityLevelPresenter from './complexityLevelPresenter'
import DesiredOutcomesPresenter from './desiredOutcomesPresenter'
import utils from '../../utils/utils'

export default class CheckAnswersPresenter {
  constructor(private readonly referral: DraftReferral, private readonly serviceCategories: ServiceCategory[]) {}

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
      const serviceCategory = this.serviceCategories.find(aCategory => aCategory.id === serviceCategoryId)

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

  private readonly serviceUserName = this.referral.serviceUser?.firstName ?? ''
}

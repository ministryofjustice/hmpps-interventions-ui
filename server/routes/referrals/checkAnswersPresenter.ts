import DraftReferral from '../../models/draftReferral'
import ServiceCategory from '../../models/serviceCategory'
import { SummaryListItem } from '../../utils/summaryList'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'
import NeedsAndRequirementsPresenter from './needsAndRequirementsPresenter'

export default class CheckAnswersPresenter {
  constructor(private readonly referral: DraftReferral, private readonly serviceCategory: ServiceCategory) {}

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

  private readonly serviceUserName = this.referral.serviceUser?.firstName ?? ''
}

import DraftReferral from '../../models/draftReferral'
import ServiceCategory from '../../models/serviceCategory'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import utils from '../../utils/utils'

export default class DesiredOutcomesPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string[]> | null = null
  ) {}

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'desired-outcomes-ids')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly desiredOutcomes: {
    value: string
    text: string
    checked: boolean
  }[] = this.serviceCategory.desiredOutcomes.map(desiredOutcome => {
    return {
      value: desiredOutcome.id,
      text: desiredOutcome.description,
      checked: this.selectedDesiredOutcomeIds.includes(desiredOutcome.id),
    }
  })

  private get selectedDesiredOutcomeIds(): string[] {
    if (this.userInputData) {
      return this.userInputData['desired-outcomes-ids'] ?? []
    }

    return (
      this.referral.desiredOutcomes?.find(val => val.serviceCategoryId === this.serviceCategory.id)
        ?.desiredOutcomesIds ?? []
    )
  }

  readonly title = `What are the desired outcomes for the ${utils.convertToProperCase(
    this.serviceCategory.name
  )} service?`
}

import DraftReferral from '../../models/draftReferral'
import ServiceCategory from '../../models/serviceCategory'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import utils from '../../utils/utils'

export default class ComplexityLevelPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'complexity-level-id')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly complexityDescriptions: {
    title: string
    value: string
    hint: string
    checked: boolean
  }[] = this.serviceCategory.complexityLevels.map(complexityLevel => {
    return {
      title: complexityLevel.title,
      value: complexityLevel.id,
      hint: complexityLevel.description,
      checked: this.selectedComplexityLevelId === complexityLevel.id,
    }
  })

  private get selectedComplexityLevelId() {
    if (this.userInputData) {
      return this.userInputData['complexity-level-id']
    }

    return (
      this.referral.complexityLevels?.find(val => val.serviceCategoryId === this.serviceCategory.id)
        ?.complexityLevelId ?? null
    )
  }

  readonly title = `What is the complexity level for the ${utils.convertToProperCase(
    this.serviceCategory.name
  )} service?`
}

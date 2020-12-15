import { DraftReferral, ServiceCategory } from '../../services/interventionsService'

export interface ComplexityLevelError {
  message: string
}

export default class ComplexityLevelPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    readonly error?: ComplexityLevelError | null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

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
    return this.userInputData ? this.userInputData['complexity-level'] : this.referral.complexityLevelId
  }

  readonly title = `What is the complexity level for the ${this.serviceCategory.name} service?`
}

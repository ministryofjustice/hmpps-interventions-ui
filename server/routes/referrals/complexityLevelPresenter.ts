import { ComplexityLevel, DraftReferral } from '../../services/interventionsService'

export interface ComplexityLevelError {
  message: string
}

export default class ComplexityLevelPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly complexityLevels: ComplexityLevel[],
    readonly error?: ComplexityLevelError | null
  ) {}

  readonly complexityDescriptions: {
    title: string
    value: string
    hint: string
  }[] = this.complexityLevels.map(complexityLevel => {
    return {
      title: complexityLevel.title,
      value: complexityLevel.id,
      hint: complexityLevel.description,
    }
  })

  readonly title = `What is the complexity level for the ${this.referral.serviceCategory.name} service?`
}

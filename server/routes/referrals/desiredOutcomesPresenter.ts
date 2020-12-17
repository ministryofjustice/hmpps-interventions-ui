import { DraftReferral, ServiceCategory } from '../../services/interventionsService'

export interface DesiredOutcomesError {
  message: string
}

export default class DesiredOutcomesPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    readonly error: DesiredOutcomesError | null = null,
    private readonly userInputData: Record<string, string[]> | null = null
  ) {}

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

    return this.referral.desiredOutcomesIds ?? []
  }

  readonly title = `What are the desired outcomes for the ${this.serviceCategory.name} service?`
}

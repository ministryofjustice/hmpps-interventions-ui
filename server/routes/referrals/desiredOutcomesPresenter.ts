import { ServiceCategory } from '../../services/interventionsService'

export interface DesiredOutcomesError {
  message: string
}

export default class DesiredOutcomesPresenter {
  constructor(private readonly serviceCategory: ServiceCategory, readonly error: DesiredOutcomesError | null = null) {}

  readonly desiredOutcomes: { value: string; text: string }[] = this.serviceCategory.desiredOutcomes.map(
    desiredOutcome => {
      return {
        value: desiredOutcome.id,
        text: desiredOutcome.description,
      }
    }
  )

  readonly title = `What are the desired outcomes for the ${this.serviceCategory.name} service?`
}

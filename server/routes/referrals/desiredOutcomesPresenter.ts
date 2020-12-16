import { ServiceCategory } from '../../services/interventionsService'

export default class DesiredOutcomesPresenter {
  constructor(private readonly serviceCategory: ServiceCategory) {}

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

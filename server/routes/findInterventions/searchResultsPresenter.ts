import { Intervention } from '../../services/interventionsService'
import InterventionDetailsPresenter from './interventionDetailsPresenter'

export default class SearchResultsPresenter {
  constructor(private readonly interventions: Intervention[]) {}

  readonly results: InterventionDetailsPresenter[] = this.interventions.map(
    intervention => new InterventionDetailsPresenter(intervention)
  )

  readonly text = {
    results: {
      count: this.results.length.toString(),
      countSuffix: `${this.results.length === 1 ? 'result' : 'results'} found.`,
    },
  }
}

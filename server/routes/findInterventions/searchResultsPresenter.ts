import { Intervention, PCCRegion } from '../../services/interventionsService'
import InterventionDetailsPresenter from './interventionDetailsPresenter'
import InterventionsFilter from './interventionsFilter'
import SearchSummaryPresenter from './searchSummaryPresenter'

export default class SearchResultsPresenter {
  constructor(
    private readonly interventions: Intervention[],
    private readonly filter: InterventionsFilter,
    private readonly pccRegions: PCCRegion[]
  ) {}

  readonly pccRegionFilters: {
    value: string
    text: string
    checked: boolean
  }[] = this.pccRegions.map(region => ({
    value: region.id,
    text: region.name,
    checked: this.filter.pccRegionIds?.includes(region.id) ?? false,
  }))

  readonly genderFilters: {
    value: string
    text: string
    checked: boolean
  }[] = [
    {
      value: 'male',
      text: 'Male',
      checked: this.filter.gender?.includes('male') ?? false,
    },
    {
      value: 'female',
      text: 'Female',
      checked: this.filter.gender?.includes('female') ?? false,
    },
  ]

  readonly ageFilters: {
    value: string
    text: string
    checked: boolean
  }[] = [
    {
      value: '18-to-25-only',
      text: 'Only for ages 18 to 25',
      checked: this.filter.age?.includes('18-to-25-only') ?? false,
    },
  ]

  readonly summary: SearchSummaryPresenter = new SearchSummaryPresenter(this.filter, this.pccRegions)

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

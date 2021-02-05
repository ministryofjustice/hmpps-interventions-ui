import { Eligibility, Intervention } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'

export interface SearchResultPresenter {
  title: string
  href: string
  body: string
  summary: SummaryListItem[]
}

export default class SearchResultsPresenter {
  constructor(private readonly interventions: Intervention[]) {}

  readonly results: SearchResultPresenter[] = this.interventions.map(intervention => ({
    title: intervention.title,
    href: '#',
    body: intervention.description,
    summary: [
      {
        key: 'Type',
        lines: ['Dynamic Framework'],
        isList: false,
      },
      {
        key: 'Location',
        lines: [intervention.pccRegions.map(region => region.name).join(', ')],
        isList: false,
      },
      {
        key: 'Criminogenic needs',
        lines: [utils.convertToProperCase(intervention.serviceCategory.name)],
        isList: false,
      },
      {
        key: 'Provider',
        lines: [intervention.serviceProvider.name],
        isList: false,
      },
      {
        key: 'Age group',
        lines: [SearchResultsPresenter.ageGroupDescription(intervention.eligibility)],
        isList: false,
      },
      {
        key: 'Sex',
        lines: [SearchResultsPresenter.sexDescription(intervention.eligibility)],
        isList: false,
      },
    ],
  }))

  private static ageGroupDescription(eligibility: Eligibility): string {
    if (eligibility.maximumAge === null) {
      return `${eligibility.minimumAge}+`
    }
    return `${eligibility.minimumAge}–${eligibility.maximumAge}`
  }

  private static sexDescription(eligibility: Eligibility): string {
    if (eligibility.allowsMale && eligibility.allowsFemale) {
      return 'Male and female'
    }
    if (eligibility.allowsMale) {
      return 'Male'
    }
    if (eligibility.allowsFemale) {
      return 'Female'
    }

    return ''
  }

  readonly text = {
    results: {
      count: this.results.length.toString(),
      countSuffix: `${this.results.length === 1 ? 'result' : 'results'} found.`,
    },
  }
}

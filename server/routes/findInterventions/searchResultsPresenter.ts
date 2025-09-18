import Intervention from '../../models/intervention'
import PCCRegion from '../../models/pccRegion'
import InterventionDetailsPresenter from './interventionDetailsPresenter'
import InterventionsFilter from './interventionsFilter'
import SearchSummaryPresenter from './searchSummaryPresenter'
import LoggedInUser from '../../models/loggedInUser'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'

export default class SearchResultsPresenter {
  readonly backLinkUrl: string

  readonly crsHomePageUrl: string

  readonly crsHomePage = `/crs-homepage`

  constructor(
    private readonly interventions: Intervention[],
    private readonly filter: InterventionsFilter,
    private readonly pccRegions: PCCRegion[],
    private readonly disableDowntimeBanner: boolean,
    private readonly findInterventionUrl: string,
    private readonly loggedInUser: LoggedInUser
  ) {
    this.backLinkUrl = this.crsHomePage
    this.crsHomePageUrl = this.crsHomePage
  }

  readonly navItemsPresenter = new PrimaryNavBarPresenter('Find interventions', this.loggedInUser)

  readonly closeHref = `${this.findInterventionUrl}?dismissDowntimeBanner=true`

  readonly pccRegionFilters: {
    value: string
    text: string
    checked: boolean
  }[] = this.pccRegions
    .map(region => ({
      value: region.id,
      text: region.name,
      checked: this.filter.pccRegionIds?.includes(region.id) ?? false,
    }))
    .sort((a, b) => a.text.localeCompare(b.text))

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
    intervention => new InterventionDetailsPresenter(intervention, this.loggedInUser)
  )

  readonly text = {
    results: {
      count: this.results.length.toString(),
      countSuffix: `${this.results.length === 1 ? 'result' : 'results'} found.`,
    },
  }
}

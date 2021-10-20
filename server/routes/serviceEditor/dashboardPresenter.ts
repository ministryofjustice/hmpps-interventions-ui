import Intervention from '../../models/intervention'
import LoggedInUser from '../../models/loggedInUser'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import { SummaryListItem } from '../../utils/summaryList'

export default class DashboardPresenter {
  constructor(private readonly loggedInUser: LoggedInUser, private readonly interventions: Intervention[]) {}

  readonly primaryNavBarPresenter = new PrimaryNavBarPresenter('My services', this.loggedInUser)

  readonly text = {
    pageTitle: 'My services',
    pageSubTitle: 'Dashboard',
    pageHeading: 'My services',
  }

  get serviceTitlesAndSummaries(): [string, SummaryListItem[]][] {
    const titlesAndSummaries: [string, SummaryListItem[]][] = []
    this.interventions.forEach(intervention => {
      titlesAndSummaries.push([
        intervention.title,
        [
          {
            key: 'Type',
            lines: ['Commissioned Rehabilitative Services (CRS)'],
          },
          {
            key: 'Prime service provider',
            lines: [intervention.serviceProvider.name],
          },
          {
            key: 'Email address for referral notifications',
            lines: [intervention.incomingReferralDistributionEmail],
            changeLink: '#',
          },
          {
            key: 'Region(s)',
            lines: intervention.pccRegions.map(region => region.name),
          },
        ],
      ])
    })
    return titlesAndSummaries
  }
}

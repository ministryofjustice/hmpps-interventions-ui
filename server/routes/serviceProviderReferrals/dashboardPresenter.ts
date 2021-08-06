import CalendarDay from '../../utils/calendarDay'
import PresenterUtils from '../../utils/presenterUtils'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import DashboardNavPresenter from './dashboardNavPresenter'
import ServiceProviderSentReferralSummary from '../../models/serviceProviderSentReferralSummary'
import utils from '../../utils/utils'

export default class DashboardPresenter {
  constructor(private readonly referralsSummary: ServiceProviderSentReferralSummary[]) {}

  readonly tableHeadings: SortableTableHeaders = [
    { text: 'Date received', sort: 'none' },
    { text: 'Referral', sort: 'none' },
    { text: 'Service user', sort: 'none' },
    { text: 'Intervention type', sort: 'none' },
    { text: 'Caseworker', sort: 'none' },
    { text: 'Action', sort: 'none' },
  ]

  readonly navItemsPresenter = new DashboardNavPresenter('All cases')

  readonly tableRows: SortableTableRow[] = this.referralsSummary.map(referralSummary => {
    const sentAtDay = CalendarDay.britishDayForDate(new Date(referralSummary.sentAt))
    return [
      {
        text: PresenterUtils.govukShortFormattedDate(sentAtDay),
        sortValue: sentAtDay.iso8601,
        href: null,
      },
      { text: referralSummary.referenceNumber, sortValue: null, href: null },
      {
        text: utils.convertToTitleCase(
          `${referralSummary.serviceUserFirstName ?? ''} ${referralSummary.serviceUserLastName ?? ''}`
        ),
        sortValue: `${referralSummary.serviceUserLastName ?? ''}, ${
          referralSummary.serviceUserFirstName ?? ''
        }`.toLocaleLowerCase('en-GB'),
        href: null,
      },
      { text: referralSummary.interventionTitle, sortValue: null, href: null },
      { text: referralSummary.assignedToUserName ?? '', sortValue: null, href: null },
      { text: 'View', sortValue: null, href: DashboardPresenter.hrefForViewing(referralSummary) },
    ]
  })

  private static hrefForViewing(referralSummary: ServiceProviderSentReferralSummary): string {
    if (referralSummary.assignedToUserName === null || referralSummary.assignedToUserName === undefined) {
      return `/service-provider/referrals/${referralSummary.referralId}/details`
    }

    return `/service-provider/referrals/${referralSummary.referralId}/progress`
  }
}

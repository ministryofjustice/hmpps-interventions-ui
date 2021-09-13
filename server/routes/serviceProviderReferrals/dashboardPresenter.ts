import CalendarDay from '../../utils/calendarDay'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import DashboardNavPresenter from './dashboardNavPresenter'
import ServiceProviderSentReferralSummary from '../../models/serviceProviderSentReferralSummary'
import utils from '../../utils/utils'
import DateUtils from '../../utils/dateUtils'

export default class DashboardPresenter {
  constructor(private readonly referralsSummary: ServiceProviderSentReferralSummary[]) {}

  readonly tableHeadings: SortableTableHeaders = [
    { text: 'Date received', sort: 'none', persistentId: 'dateReceived' },
    { text: 'Referral', sort: 'none', persistentId: 'referenceNumber' },
    { text: 'Service user', sort: 'none', persistentId: 'serviceUser' },
    { text: 'Intervention type', sort: 'none', persistentId: 'interventionType' },
    { text: 'Caseworker', sort: 'none', persistentId: 'caseworker' },
    { text: 'Action', sort: 'none', persistentId: 'action' },
  ]

  readonly navItemsPresenter = new DashboardNavPresenter('All cases')

  readonly tableRows: SortableTableRow[] = this.referralsSummary.map(referralSummary => {
    const sentAtDay = CalendarDay.britishDayForDate(new Date(referralSummary.sentAt))
    return [
      {
        text: DateUtils.formattedDate(sentAtDay, { month: 'short' }),
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

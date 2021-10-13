import CalendarDay from '../../utils/calendarDay'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import DashboardNavPresenter from './dashboardNavPresenter'
import ServiceProviderSentReferralSummary from '../../models/serviceProviderSentReferralSummary'
import utils from '../../utils/utils'
import DateUtils from '../../utils/dateUtils'

export type DashboardType = 'My cases' | 'All open cases' | 'Unassigned cases' | 'Completed cases'
export default class DashboardPresenter {
  constructor(
    private readonly referralsSummary: ServiceProviderSentReferralSummary[],
    readonly dashboardType: DashboardType
  ) {}

  private readonly showAssignedCaseworkerColumn =
    this.dashboardType === 'My cases' || this.dashboardType === 'Unassigned cases'

  private readonly dashBoardTypePersistentId = this.dashboardType.replace(/\s/g, '')

  readonly title = this.dashboardType

  readonly tableHeadings: SortableTableHeaders = [
    { text: 'Date received', sort: 'none', persistentId: `${this.dashBoardTypePersistentId}DateReceived` },
    { text: 'Referral', sort: 'none', persistentId: `${this.dashBoardTypePersistentId}ReferenceNumber` },
    { text: 'Service user', sort: 'none', persistentId: `${this.dashBoardTypePersistentId}ServiceUser` },
    { text: 'Intervention type', sort: 'none', persistentId: `${this.dashBoardTypePersistentId}InterventionType` },
    this.showAssignedCaseworkerColumn
      ? null
      : { text: 'Caseworker', sort: 'none', persistentId: `${this.dashBoardTypePersistentId}Caseworker` },
    { text: 'Action', sort: 'none', persistentId: `${this.dashBoardTypePersistentId}Action` },
  ].filter(row => row !== null) as SortableTableHeaders

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
      this.showAssignedCaseworkerColumn
        ? null
        : { text: referralSummary.assignedToUserName ?? '', sortValue: null, href: null },
      { text: 'View', sortValue: null, href: DashboardPresenter.hrefForViewing(referralSummary) },
    ].filter(row => row !== null) as SortableTableRow
  })

  private static hrefForViewing(referralSummary: ServiceProviderSentReferralSummary): string {
    if (referralSummary.assignedToUserName === null || referralSummary.assignedToUserName === undefined) {
      return `/service-provider/referrals/${referralSummary.referralId}/details`
    }

    return `/service-provider/referrals/${referralSummary.referralId}/progress`
  }
}

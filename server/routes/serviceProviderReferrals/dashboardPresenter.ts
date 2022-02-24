import CalendarDay from '../../utils/calendarDay'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import utils from '../../utils/utils'
import DateUtils from '../../utils/dateUtils'
import LoggedInUser from '../../models/loggedInUser'
import { Page } from '../../models/pagination'
import SentReferral from '../../models/sentReferral'
import Intervention from '../../models/intervention'
import Pagination from '../../utils/pagination/pagination'

export type DashboardType = 'My cases' | 'All open cases' | 'Unassigned cases' | 'Completed cases'
export default class DashboardPresenter {
  public readonly pagination: Pagination

  constructor(
    private readonly sentReferrals: Page<SentReferral>,
    readonly dashboardType: DashboardType,
    private readonly loggedInUser: LoggedInUser,
    private readonly interventions: Intervention[]
  ) {
    this.pagination = new Pagination(sentReferrals)
  }

  private readonly showAssignedCaseworkerColumn =
    this.dashboardType === 'My cases' || this.dashboardType === 'Unassigned cases'

  readonly dashboardTypePersistentId = this.dashboardType.replace(/\s/g, '')

  readonly title = this.dashboardType

  private readonly secondOrderColumn = 'Date received'

  readonly tableHeadings: SortableTableHeaders = [
    { text: this.secondOrderColumn, sort: 'none', persistentId: `${this.dashboardTypePersistentId}DateReceived` },
    { text: 'Referral', sort: 'none', persistentId: `${this.dashboardTypePersistentId}ReferenceNumber` },
    { text: 'Service user', sort: 'none', persistentId: `${this.dashboardTypePersistentId}ServiceUser` },
    { text: 'Intervention type', sort: 'none', persistentId: `${this.dashboardTypePersistentId}InterventionType` },
    this.showAssignedCaseworkerColumn
      ? null
      : { text: 'Caseworker', sort: 'none', persistentId: `${this.dashboardTypePersistentId}Caseworker` },
    { text: 'Action', sort: 'none', persistentId: `${this.dashboardTypePersistentId}Action` },
  ].filter(row => row !== null) as SortableTableHeaders

  readonly secondOrderColumnNumber: number = this.tableHeadings
    .map(heading => heading.text)
    .indexOf(this.secondOrderColumn)

  readonly navItemsPresenter = new PrimaryNavBarPresenter('Referrals', this.loggedInUser)

  readonly tableRows: SortableTableRow[] = this.sentReferrals.content.map(referralSummary => {
    const sentAtDay = CalendarDay.britishDayForDate(new Date(referralSummary.sentAt))
    const interventionForReferral = this.interventions.find(
      intervention => intervention.id === referralSummary.referral.interventionId
    )
    if (interventionForReferral === undefined) {
      throw new Error(
        `Expected referral ${referralSummary.id} to be linked to an intervention with ID ${referralSummary.referral.interventionId}`
      )
    }
    return [
      {
        text: DateUtils.formattedDate(sentAtDay, { month: 'short' }),
        sortValue: sentAtDay.iso8601,
        href: null,
      },
      { text: referralSummary.referenceNumber, sortValue: null, href: null },
      {
        text: utils.convertToTitleCase(
          `${referralSummary.referral.serviceUser.firstName ?? ''} ${
            referralSummary.referral.serviceUser.lastName ?? ''
          }`
        ),
        sortValue: `${referralSummary.referral.serviceUser.lastName ?? ''}, ${
          referralSummary.referral.serviceUser.firstName ?? ''
        }`.toLocaleLowerCase('en-GB'),
        href: null,
      },
      { text: interventionForReferral.title, sortValue: null, href: null },
      this.showAssignedCaseworkerColumn
        ? null
        : { text: referralSummary.assignedTo?.username ?? '', sortValue: null, href: null },
      { text: 'View', sortValue: null, href: DashboardPresenter.hrefForViewing(referralSummary) },
    ].filter(row => row !== null) as SortableTableRow
  })

  private static hrefForViewing(referralSummary: SentReferral): string {
    if (referralSummary.assignedTo?.username === null || referralSummary.assignedTo?.username === undefined) {
      return `/service-provider/referrals/${referralSummary.id}/details`
    }

    return `/service-provider/referrals/${referralSummary.id}/progress`
  }
}

import CalendarDay from '../../utils/calendarDay'
import DateUtils from '../../utils/dateUtils'
import PresenterUtils from '../../utils/presenterUtils'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import LoggedInUser from '../../models/loggedInUser'
import { Page } from '../../models/pagination'
import Pagination from '../../utils/pagination/pagination'
import ControllerUtils from '../../utils/controllerUtils'
import SentReferralSummaries from '../../models/sentReferralSummaries'

export type PPDashboardType = 'Open cases' | 'Unassigned cases' | 'Completed cases' | 'Cancelled cases'
export default class DashboardPresenter {
  public readonly pagination: Pagination

  private readonly requestedSortField: string

  private readonly requestedSortOrder: string

  constructor(
    private readonly sentReferrals: Page<SentReferralSummaries>,
    private readonly loggedInUser: LoggedInUser,
    readonly dashboardType: PPDashboardType,
    readonly tablePersistentId: string,
    private readonly requestedSort: string,
    readonly disableDowntimeBanner: boolean,
    readonly dashboardOrigin: string,
  ) {
    this.pagination = new Pagination(sentReferrals)

    const [sortField, sortOrder] = this.requestedSort.split(',')
    this.requestedSortField = sortField
    this.requestedSortOrder = ControllerUtils.sortOrderToAriaSort(sortOrder)
  }

  get closeHref(): string {
    return `${this.dashboardOrigin}?dismissDowntimeBanner=true`
  }

  // this maps the column headings in the table to the database field used
  // for sorting in the backend. it feels strange that the presenter class owns
  // this information, since it's used in the controller to make the API call
  // to populate this table. however, the controller reads these sort fields
  // from query params which are populated from the table. so in the end this
  // does seem like the best place to define these values.
  static readonly headingsAndSortFields = [
    {
      columnName: 'Date sent',
      sortField: 'sentAt',
    },
    {
      columnName: 'Referral',
      sortField: 'referenceNumber',
    },
    {
      columnName: 'Person',
      sortField: 'serviceUserData.lastName',
    },
    {
      columnName: 'Intervention type',
      sortField: 'intervention.title',
    },
    {
      columnName: 'Provider',
      sortField: 'intervention.dynamicFrameworkContract.primeProvider.name',
    },
    {
      columnName: 'Caseworker',
      sortField: 'assignments.assignedTo.userName',
    },
    {
      columnName: 'Action',
      sortField: null,
    },
  ]

  private readonly showAssignedCaseworkerColumn = this.dashboardType !== 'Unassigned cases'

  readonly title = this.dashboardType

  readonly navItemsPresenter = new PrimaryNavBarPresenter('Referrals', this.loggedInUser)

  get tableHeadings(): SortableTableHeaders {
    return DashboardPresenter.headingsAndSortFields
      .map(heading => {
        return {
          text: heading.columnName,
          persistentId: heading.sortField,
          sort: this.requestedSortField === heading.sortField ? this.requestedSortOrder : 'none',
        }
      })
      .filter(row => row.text !== 'Caseworker' || this.showAssignedCaseworkerColumn) as SortableTableHeaders
  }

  readonly tableRows: SortableTableRow[] = this.sentReferrals.content.map(referral => {
    // i really want the actual names here, but that's an API call for each row - how can we improve this?
    const assignee = referral.assignedTo?.username || 'Unassigned'
    const sentAtDay = CalendarDay.britishDayForDate(new Date(referral.sentAt))

    return [
      {
        text: DateUtils.formattedDate(sentAtDay, { month: 'short' }),
        sortValue: sentAtDay.iso8601,
        href: null,
      },
      {
        text: referral.referenceNumber,
        sortValue: referral.referenceNumber,
        href: null,
      },
      {
        text: PresenterUtils.fullName(referral.serviceUser),
        sortValue: PresenterUtils.fullNameSortValue(referral.serviceUser),
        href: null,
      },
      {
        text: referral.interventionTitle,
        sortValue: null,
        href: null,
      },
      {
        text: referral.serviceProvider.name,
        sortValue: referral.serviceProvider.name,
        href: null,
      },
      this.showAssignedCaseworkerColumn
        ? {
            text: assignee,
            sortValue: assignee,
            href: null,
          }
        : null,
      {
        text: 'View',
        sortValue: null,
        href: `/probation-practitioner/referrals/${referral.id}/progress`,
      },
    ].filter(row => row !== null) as SortableTableRow
  })
}

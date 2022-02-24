import Intervention from '../../models/intervention'
import SentReferral from '../../models/sentReferral'
import CalendarDay from '../../utils/calendarDay'
import DateUtils from '../../utils/dateUtils'
import PresenterUtils from '../../utils/presenterUtils'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import LoggedInUser from '../../models/loggedInUser'
import { Page } from '../../models/pagination'
import Pagination from '../../utils/pagination/pagination'
import ControllerUtils from '../../utils/controllerUtils'

export type PPDashboardType = 'Open cases' | 'Unassigned cases' | 'Completed cases' | 'Cancelled cases'
export default class DashboardPresenter {
  public readonly pagination: Pagination

  private readonly requestedSortField: string

  private readonly requestedSortOrder: string

  constructor(
    private readonly sentReferrals: Page<SentReferral>,
    private readonly interventions: Intervention[],
    private readonly loggedInUser: LoggedInUser,
    readonly dashboardType: PPDashboardType,
    readonly tablePersistentId: string,
    private readonly requestedSort: string
  ) {
    this.pagination = new Pagination(sentReferrals)

    const [sortField, sortOrder] = this.requestedSort.split(',')
    this.requestedSortField = sortField
    this.requestedSortOrder = ControllerUtils.sortOrderToAriaSort(sortOrder)
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
      columnName: 'Service user',
      sortField: 'serviceUserData.lastName',
    },
    {
      columnName: 'Intervention type',
      sortField: 'intervention.dynamicFrameworkContract.contractType',
    },
    {
      columnName: 'Provider',
      sortField: 'intervention.dynamicFrameworkContract.primeProvider.name',
    },
    {
      columnName: 'Caseworker',
      sortField: null,
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
    const interventionForReferral = this.interventions.find(
      intervention => intervention.id === referral.referral.interventionId
    )
    if (interventionForReferral === undefined) {
      throw new Error(`Expected referral to be linked to an intervention with ID ${referral.referral.interventionId}`)
    }

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
        text: PresenterUtils.fullName(referral.referral.serviceUser),
        sortValue: PresenterUtils.fullNameSortValue(referral.referral.serviceUser),
        href: null,
      },
      {
        text: interventionForReferral.title,
        sortValue: null,
        href: null,
      },
      {
        text: referral.referral.serviceProvider.name,
        sortValue: referral.referral.serviceProvider.name,
        href: null,
      },
      this.showAssignedCaseworkerColumn
        ? {
            text: assignee,
            sortValue: null,
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

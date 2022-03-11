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
import ControllerUtils from '../../utils/controllerUtils'

export type DashboardType = 'My cases' | 'All open cases' | 'Unassigned cases' | 'Completed cases'
export default class DashboardPresenter {
  public readonly pagination: Pagination

  private readonly requestedSortField: string

  private readonly requestedSortOrder: string

  constructor(
    private readonly sentReferrals: Page<SentReferral>,
    readonly dashboardType: DashboardType,
    private readonly loggedInUser: LoggedInUser,
    private readonly interventions: Intervention[],
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
      columnName: 'Date received',
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
      columnName: 'Caseworker',
      sortField: null,
    },
    {
      columnName: 'Action',
      sortField: null,
    },
  ]

  private readonly showAssignedCaseworkerColumn =
    this.dashboardType === 'All open cases' || this.dashboardType === 'Completed cases'

  readonly title = this.dashboardType

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
        ? { text: referralSummary.assignedTo?.username ?? '', sortValue: null, href: null }
        : null,
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

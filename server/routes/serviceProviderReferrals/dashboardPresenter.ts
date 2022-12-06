import CalendarDay from '../../utils/calendarDay'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import utils from '../../utils/utils'
import DateUtils from '../../utils/dateUtils'
import LoggedInUser from '../../models/loggedInUser'
import { Page } from '../../models/pagination'
import Pagination from '../../utils/pagination/pagination'
import ControllerUtils from '../../utils/controllerUtils'
import SentReferralSummaries from '../../models/sentReferralSummaries'
import PresenterUtils from '../../utils/presenterUtils'
import DashboardDetails from '../../models/dashboardDetails'

export type DashboardType = 'My cases' | 'All open cases' | 'Unassigned cases' | 'Completed cases'
const dashboardDetails: Record<DashboardType, DashboardDetails> = {
  'My cases': { tabHref: '/service-provider/dashboard', displayText: 'my cases' },
  'All open cases': { tabHref: '/service-provider/dashboard/all-open-cases', displayText: 'open cases' },
  'Unassigned cases': { tabHref: '/service-provider/dashboard/unassigned-cases', displayText: 'unassigned cases' },
  'Completed cases': { tabHref: '/service-provider/dashboard/completed-cases', displayText: 'completed cases' },
}

export default class DashboardPresenter {
  public readonly pagination: Pagination

  private readonly requestedSortField: string

  private readonly requestedSortOrder: string

  constructor(
    private readonly sentReferralSummaries: Page<SentReferralSummaries>,
    readonly dashboardType: DashboardType,
    private readonly loggedInUser: LoggedInUser,
    readonly tablePersistentId: string,
    private readonly requestedSort: string,
    readonly searchText: string | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.pagination = new Pagination(sentReferralSummaries, this.searchText ? `case-search-text=${searchText}` : null)
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
      sortField: 'assignments.assignedTo.userName',
    },
    {
      columnName: 'Action',
      sortField: null,
    },
  ]

  private readonly showAssignedCaseworkerColumn =
    this.dashboardType === 'All open cases' || this.dashboardType === 'Completed cases'

  readonly isSearchable =
    this.dashboardType === 'All open cases' ||
    this.dashboardType === 'Unassigned cases' ||
    this.dashboardType === 'Completed cases'

  readonly title = this.dashboardType

  readonly SearchText = this.searchText

  readonly hrefSearchText = `/service-provider/dashboard/all-open-cases`

  readonly presenterUtils = new PresenterUtils(this.userInputData).selectionValue

  readonly borderStyle = 'govuk-width-container--grey'

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

  get hrefLinkForSearch(): string {
    return dashboardDetails[this.dashboardType].tabHref
  }

  get casesType(): string {
    return dashboardDetails[this.dashboardType].displayText
  }

  readonly navItemsPresenter = new PrimaryNavBarPresenter('Referrals', this.loggedInUser)

  readonly tableRows: SortableTableRow[] = this.sentReferralSummaries.content.map(referralSummary => {
    const sentAtDay = CalendarDay.britishDayForDate(new Date(referralSummary.sentAt))
    const assignee = referralSummary.assignedTo?.username || 'Unassigned'
    return [
      {
        text: DateUtils.formattedDate(sentAtDay, { month: 'short' }),
        sortValue: sentAtDay.iso8601,
        href: null,
      },
      { text: referralSummary.referenceNumber, sortValue: null, href: null },
      {
        text: utils.convertToTitleCase(
          `${referralSummary.serviceUser.firstName ?? ''} ${referralSummary.serviceUser.lastName ?? ''}`
        ),
        sortValue: `${referralSummary.serviceUser.lastName ?? ''}, ${
          referralSummary.serviceUser.firstName ?? ''
        }`.toLocaleLowerCase('en-GB'),
        href: null,
      },
      { text: referralSummary.interventionTitle, sortValue: null, href: null },
      this.showAssignedCaseworkerColumn
        ? { text: referralSummary.assignedTo?.username ?? '', sortValue: assignee, href: null }
        : null,
      { text: 'View', sortValue: null, href: DashboardPresenter.hrefForViewing(referralSummary) },
    ].filter(row => row !== null) as SortableTableRow
  })

  private static hrefForViewing(referralSummary: SentReferralSummaries): string {
    if (referralSummary.assignedTo?.username === null || referralSummary.assignedTo?.username === undefined) {
      return `/service-provider/referrals/${referralSummary.id}/details`
    }

    return `/service-provider/referrals/${referralSummary.id}/progress`
  }
}

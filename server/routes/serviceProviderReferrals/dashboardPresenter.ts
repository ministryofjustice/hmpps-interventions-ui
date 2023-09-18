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
import Prison from '../../models/prisonRegister/prison'

export type DashboardType = 'My cases' | 'All open cases' | 'Unassigned cases' | 'Completed cases'
const dashboardDetails: Record<DashboardType, DashboardDetails> = {
  'My cases': {
    tabHref: '/service-provider/dashboard',
    displayText: 'my cases',
    isSearchable: false,
    showAssignedCaseworker: false,
    showReleaseDateAndLocation: false,
  },
  'All open cases': {
    tabHref: '/service-provider/dashboard/all-open-cases',
    displayText: 'open cases',
    isSearchable: true,
    showAssignedCaseworker: true,
    showReleaseDateAndLocation: false,
  },
  'Unassigned cases': {
    tabHref: '/service-provider/dashboard/unassigned-cases',
    displayText: 'unassigned cases',
    isSearchable: true,
    showAssignedCaseworker: false,
    showReleaseDateAndLocation: true,
  },
  'Completed cases': {
    tabHref: '/service-provider/dashboard/completed-cases',
    displayText: 'completed cases',
    isSearchable: true,
    showAssignedCaseworker: true,
    showReleaseDateAndLocation: false,
  },
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
    readonly disableDowntimeBanner: boolean,
    readonly dashboardOrigin: string,
    private prisons: Prison[],
    readonly searchText: string | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.pagination = new Pagination(sentReferralSummaries, this.searchText ? `paginatedSearch=true` : null)
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
      columnName: 'Name/CRN',
      sortField: 'serviceUserData.lastName',
    },
    {
      columnName: 'Expected release date',
      sortField: 'referralLocation.expectedReleaseDate',
    },
    {
      columnName: 'Location',
    },
    {
      columnName: 'Referral number',
      sortField: 'referenceNumber',
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
      columnName: 'Date received',
      sortField: 'sentAt',
    },
  ]

  private readonly showAssignedCaseworkerColumn = dashboardDetails[this.dashboardType].showAssignedCaseworker

  private readonly showReleaseDateAndLocationColumn = dashboardDetails[this.dashboardType].showReleaseDateAndLocation

  readonly isSearchable = dashboardDetails[this.dashboardType].isSearchable

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
      .filter(
        row =>
          (row.text !== 'Caseworker' || this.showAssignedCaseworkerColumn) &&
          (row.text !== 'Expected release date' || this.showReleaseDateAndLocationColumn) &&
          (row.text !== 'Location' || this.showReleaseDateAndLocationColumn)
      ) as SortableTableHeaders
  }

  get hrefLinkForSearch(): string {
    return `${dashboardDetails[this.dashboardType].tabHref}?paginatedSearch=true`
  }

  get hrefLinkForClear(): string {
    return dashboardDetails[this.dashboardType].tabHref
  }

  get casesType(): string {
    return dashboardDetails[this.dashboardType].displayText
  }

  readonly navItemsPresenter = new PrimaryNavBarPresenter('Referrals', this.loggedInUser)

  readonly tableRows: SortableTableRow[] = this.sentReferralSummaries.content.map(referralSummary => {
    const sentAtDay = CalendarDay.britishDayForDate(new Date(referralSummary.sentAt))
    const releaseDateorDescription = this.determineExpectedReleaseDate(referralSummary)
    const expectedReleaseDate =
      referralSummary.locationType === 'CUSTODY' && referralSummary.expectedReleaseDate
        ? CalendarDay.britishDayForDate(new Date(referralSummary.expectedReleaseDate))
        : null
    const assignee = referralSummary.assignedTo?.username || 'Unassigned'
    const locationName = this.getLocation(referralSummary)
    const serviceUserName = utils.convertToTitleCase(
      `${referralSummary.serviceUser.firstName ?? ''} ${referralSummary.serviceUser.lastName ?? ''}`
    )
    const { crn } = referralSummary.serviceUser
    const serviceUserNameCrn = `${serviceUserName}:${crn}`
    return [
      {
        text: serviceUserNameCrn,
        sortValue: `${referralSummary.serviceUser.lastName ?? ''}, ${
          referralSummary.serviceUser.firstName ?? ''
        }`.toLocaleLowerCase('en-GB'),
        href: DashboardPresenter.hrefForViewing(referralSummary),
        doubleCell: true,
      },
      this.showReleaseDateAndLocationColumn
        ? {
            text: expectedReleaseDate
              ? DateUtils.formattedDate(expectedReleaseDate, { month: 'short' })
              : releaseDateorDescription,
            sortValue: null,
            href: null,
          }
        : null,
      this.showReleaseDateAndLocationColumn
        ? {
            text: locationName || '',
            sortValue: null,
            href: null,
          }
        : null,
      { text: referralSummary.referenceNumber, sortValue: null, href: null },
      { text: referralSummary.interventionTitle, sortValue: null, href: null },
      this.showAssignedCaseworkerColumn
        ? { text: referralSummary.assignedTo?.username ?? '', sortValue: assignee, href: null }
        : null,
      {
        text: DateUtils.formattedDate(sentAtDay, { month: 'short' }),
        sortValue: sentAtDay.iso8601,
        href: null,
      },
    ].filter(row => row !== null) as SortableTableRow
  })

  private static hrefForViewing(referralSummary: SentReferralSummaries): string {
    return `/service-provider/referrals/${referralSummary.id}/progress`
  }

  private getLocation(referralSummary: SentReferralSummaries) {
    if (this.showReleaseDateAndLocationColumn && referralSummary.locationType === 'CUSTODY') {
      return this.prisons.find(prison => prison.prisonId === referralSummary.location)?.prisonName
    }
    return referralSummary.location
  }

  private determineExpectedReleaseDate(referralSummary: SentReferralSummaries): string | null {
    if (
      referralSummary.locationType === 'CUSTODY' &&
      referralSummary.isReferralReleasingIn12Weeks != null &&
      !referralSummary.isReferralReleasingIn12Weeks
    ) {
      return 'Over 12 weeks'
    }
    if (referralSummary.locationType === 'COMMUNITY') {
      return '---'
    }
    return 'Not found'
  }
}

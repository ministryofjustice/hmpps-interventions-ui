import Intervention from '../../models/intervention'
import SentReferral from '../../models/sentReferral'
import CalendarDay from '../../utils/calendarDay'
import DateUtils from '../../utils/dateUtils'
import PresenterUtils from '../../utils/presenterUtils'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import LoggedInUser from '../../models/loggedInUser'

export type PPDashboardType = 'Open cases' | 'Unassigned cases' | 'Completed cases' | 'Cancelled cases'
export default class DashboardPresenter {
  constructor(
    private readonly sentReferrals: SentReferral[],
    private readonly interventions: Intervention[],
    private readonly loggedInUser: LoggedInUser,
    readonly dashboardType: PPDashboardType
  ) {}

  private readonly showAssignedCaseworkerColumn = this.dashboardType === 'Unassigned cases'

  readonly dashboardTypePersistentId = `pp${this.dashboardType.replace(/\s/g, '')}`

  readonly title = this.dashboardType

  readonly navItemsPresenter = new PrimaryNavBarPresenter('Referrals', this.loggedInUser)

  private readonly secondOrderColumn = 'Date sent'

  readonly tableHeadings: SortableTableHeaders = [
    { text: this.secondOrderColumn, sort: 'none', persistentId: `${this.dashboardTypePersistentId}DateSent` },
    { text: 'Referral', sort: 'none', persistentId: `${this.dashboardTypePersistentId}ReferenceNumber` },
    { text: 'Service user', sort: 'ascending', persistentId: `${this.dashboardTypePersistentId}ServiceUser` },
    { text: 'Intervention type', sort: 'none', persistentId: `${this.dashboardTypePersistentId}InterventionType` },
    { text: 'Provider', sort: 'none', persistentId: `${this.dashboardTypePersistentId}Provider` },
    this.showAssignedCaseworkerColumn
      ? null
      : { text: 'Caseworker', sort: 'none', persistentId: `${this.dashboardTypePersistentId}Caseworker` },
    { text: 'Action', sort: 'none', persistentId: `${this.dashboardTypePersistentId}Action` },
  ].filter(row => row !== null) as SortableTableHeaders

  readonly secondOrderColumnNumber: number = this.tableHeadings
    .map(heading => heading.text)
    .indexOf(this.secondOrderColumn)

  readonly tableRows: SortableTableRow[] = this.sentReferrals.map(referral => {
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
        ? null
        : {
            text: assignee,
            // prefix all assigned referrals to force unassigned referrals to the back of the sorted list
            sortValue: assignee !== 'Unassigned' ? `A${assignee}` : assignee,
            href: null,
          },
      {
        text: 'View',
        sortValue: null,
        href: `/probation-practitioner/referrals/${referral.id}/progress`,
      },
    ].filter(row => row !== null) as SortableTableRow
  })
}

import Intervention from '../../models/intervention'
import SentReferral from '../../models/sentReferral'
import CalendarDay from '../../utils/calendarDay'
import DateUtils from '../../utils/dateUtils'
import PresenterUtils from '../../utils/presenterUtils'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import LoggedInUser from '../../models/loggedInUser'

export default class MyCasesPresenter {
  constructor(
    private readonly sentReferrals: SentReferral[],
    private readonly interventions: Intervention[],
    private readonly loggedInUser: LoggedInUser
  ) {}

  readonly navItemsPresenter = new PrimaryNavBarPresenter('My cases', this.loggedInUser)

  readonly tableHeadings: SortableTableHeaders = [
    { text: 'Date sent', sort: 'none', persistentId: 'dateSent' },
    { text: 'Referral', sort: 'none', persistentId: 'referenceNumber' },
    { text: 'Service user', sort: 'ascending', persistentId: 'serviceUser' },
    { text: 'Intervention type', sort: 'none', persistentId: 'interventionType' },
    { text: 'Provider', sort: 'none', persistentId: 'provider' },
    { text: 'Caseworker', sort: 'none', persistentId: 'caseworker' },
    { text: 'Action', sort: 'none', persistentId: 'action' },
  ]

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
      {
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
    ]
  })
}

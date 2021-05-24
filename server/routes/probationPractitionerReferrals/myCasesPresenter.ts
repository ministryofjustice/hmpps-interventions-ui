import Intervention from '../../models/intervention'
import SentReferral from '../../models/sentReferral'
import PresenterUtils from '../../utils/presenterUtils'
import utils from '../../utils/utils'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import DashboardNavPresenter from './dashboardNavPresenter'

export default class MyCasesPresenter {
  constructor(private readonly sentReferrals: SentReferral[], private readonly interventions: Intervention[]) {}

  readonly navItemsPresenter = new DashboardNavPresenter('My cases')

  readonly tableHeadings: SortableTableHeaders = [
    { text: 'Referral', sort: 'none' },
    { text: 'Service user', sort: 'ascending' },
    { text: 'Service Category', sort: 'none' },
    { text: 'Provider', sort: 'none' },
    { text: 'Caseworker', sort: 'none' },
    { text: 'Action', sort: 'none' },
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

    return [
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
        text: utils.convertToProperCase(interventionForReferral.contractType.name),
        sortValue: interventionForReferral.contractType.name,
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

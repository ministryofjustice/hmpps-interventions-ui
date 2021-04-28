import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import PresenterUtils from '../../utils/presenterUtils'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'
import DashboardNavPresenter from './dashboardNavPresenter'

export default class MyCasesPresenter {
  constructor(private readonly sentReferrals: SentReferral[], private readonly serviceCategories: ServiceCategory[]) {}

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
    const { serviceCategoryId } = referral.referral
    const serviceCategory = this.serviceCategories.find(aServiceCategory => aServiceCategory.id === serviceCategoryId)
    if (serviceCategory === undefined) {
      throw new Error(`Expected serviceCategories to contain service category with ID ${serviceCategoryId}`)
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
        text: serviceCategory.name,
        sortValue: serviceCategory.name,
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

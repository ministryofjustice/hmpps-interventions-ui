import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import CalendarDay from '../../utils/calendarDay'
import PresenterUtils from '../../utils/presenterUtils'
import utils from '../../utils/utils'
import { SortableTableHeaders, SortableTableRow } from '../../utils/viewUtils'

export default class DashboardPresenter {
  constructor(private readonly referrals: SentReferral[], private readonly serviceCategories: ServiceCategory[]) {}

  readonly tableHeadings: SortableTableHeaders = [
    { text: 'Date received', sort: 'none' },
    { text: 'Referral', sort: 'none' },
    { text: 'Service user', sort: 'none' },
    { text: 'Intervention type', sort: 'none' },
    { text: 'Caseworker', sort: 'none' },
    { text: 'Action', sort: 'none' },
  ]

  readonly tableRows: SortableTableRow[] = this.referrals.map(referral => {
    const { serviceCategoryId } = referral.referral
    const serviceCategory = this.serviceCategories.find(aServiceCategory => aServiceCategory.id === serviceCategoryId)
    if (serviceCategory === undefined) {
      throw new Error(`Expected serviceCategories to contain service category with ID ${serviceCategoryId}`)
    }

    const sentAtDay = CalendarDay.britishDayForDate(new Date(referral.sentAt))
    const { serviceUser } = referral.referral

    return [
      {
        text: PresenterUtils.govukShortFormattedDate(sentAtDay),
        sortValue: sentAtDay.iso8601,
        href: null,
      },
      { text: referral.referenceNumber, sortValue: null, href: null },
      {
        text: PresenterUtils.fullName(serviceUser),
        sortValue: PresenterUtils.fullNameSortValue(serviceUser),
        href: null,
      },
      { text: utils.convertToProperCase(serviceCategory.name), sortValue: null, href: null },
      { text: referral.assignedTo?.username ?? '', sortValue: null, href: null },
      { text: 'View', sortValue: null, href: DashboardPresenter.hrefForViewing(referral) },
    ]
  })

  private static hrefForViewing(referral: SentReferral): string {
    if (referral.assignedTo === null) {
      return `/service-provider/referrals/${referral.id}/details`
    }

    return `/service-provider/referrals/${referral.id}/progress`
  }
}

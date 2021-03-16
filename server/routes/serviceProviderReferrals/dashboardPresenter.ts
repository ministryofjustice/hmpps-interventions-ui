import { SentReferral, ServiceCategory } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'
import utils from '../../utils/utils'

export default class DashboardPresenter {
  constructor(private readonly referrals: SentReferral[], private readonly serviceCategories: ServiceCategory[]) {}

  readonly tableHeadings = ['Date received', 'Referral', 'Service user', 'Intervention type', 'Caseworker', 'Action']

  readonly tableRows: { text: string; sortValue: string | null; href: string | null }[][] = this.referrals.map(
    referral => {
      const { serviceCategoryId } = referral.referral
      const serviceCategory = this.serviceCategories.find(aServiceCategory => aServiceCategory.id === serviceCategoryId)
      if (serviceCategory === undefined) {
        throw new Error(`Expected serviceCategories to contain service category with ID ${serviceCategoryId}`)
      }

      const sentAtDay = CalendarDay.britishDayForDate(new Date(referral.sentAt))
      const { serviceUser } = referral.referral

      return [
        {
          text: ReferralDataPresenterUtils.govukShortFormattedDate(sentAtDay),
          sortValue: sentAtDay.iso8601,
          href: null,
        },
        { text: referral.referenceNumber, sortValue: null, href: null },
        {
          text: ReferralDataPresenterUtils.fullName(serviceUser),
          sortValue: ReferralDataPresenterUtils.fullNameSortValue(serviceUser),
          href: null,
        },
        { text: utils.convertToProperCase(serviceCategory.name), sortValue: null, href: null },
        { text: referral.assignedTo?.username ?? '', sortValue: null, href: null },
        { text: 'View', sortValue: null, href: DashboardPresenter.hrefForViewing(referral) },
      ]
    }
  )

  private static hrefForViewing(referral: SentReferral): string {
    if (referral.assignedTo === null) {
      return `/service-provider/referrals/${referral.id}/details`
    }

    return `/service-provider/referrals/${referral.id}/progress`
  }
}

import { SentReferral, ServiceCategory } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'
import utils from '../../utils/utils'

export default class DashboardPresenter {
  constructor(private readonly referrals: SentReferral[], private readonly serviceCategories: ServiceCategory[]) {}

  readonly tableHeadings = ['Date received', 'Referral', 'Service user', 'Intervention type']

  readonly tableRows: { text: string; sortValue: string | null }[][] = this.referrals.map(referral => {
    const { serviceCategoryId } = referral.referral
    const serviceCategory = this.serviceCategories.find(aServiceCategory => aServiceCategory.id === serviceCategoryId)
    if (serviceCategory === undefined) {
      throw new Error(`Expected serviceCategories to contain service category with ID ${serviceCategoryId}`)
    }

    const sentAtDay = CalendarDay.britishDayForDate(new Date(referral.sentAt))
    const { serviceUser } = referral.referral

    return [
      { text: ReferralDataPresenterUtils.govukShortFormattedDate(sentAtDay), sortValue: sentAtDay.iso8601 },
      { text: referral.referenceNumber, sortValue: null },
      {
        text: ReferralDataPresenterUtils.fullName(serviceUser),
        sortValue: ReferralDataPresenterUtils.fullNameSortValue(serviceUser),
      },
      { text: utils.convertToProperCase(serviceCategory.name), sortValue: null },
    ]
  })
}

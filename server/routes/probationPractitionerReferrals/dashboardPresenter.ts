import { DraftReferral } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'

export default class DashboardPresenter {
  constructor(private readonly draftReferrals: DraftReferral[]) {}

  get orderedReferrals(): DraftReferralSummaryPresenter[] {
    return this.draftReferrals
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1))
      .map(referral => ({
        serviceUserFullName: ReferralDataPresenterUtils.fullName(referral.serviceUser),
        createdAt: ReferralDataPresenterUtils.govukShortFormattedDate(
          CalendarDay.britishDayForDate(new Date(referral.createdAt))
        ),
        url: `/referrals/${referral.id}/form`,
      }))
  }

  readonly text = {
    noDraftReferrals: 'You do not have any draft referrals at this moment.',
  }
}

interface DraftReferralSummaryPresenter {
  serviceUserFullName: string
  createdAt: string
  url: string
}

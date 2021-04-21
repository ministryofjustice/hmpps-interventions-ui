import { DraftReferral } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import PresenterUtils from '../../utils/presenterUtils'
import DashboardNavPresenter from './dashboardNavPresenter'

export default class FindStartPresenter {
  constructor(private readonly draftReferrals: DraftReferral[]) {}

  readonly navItemsPresenter = new DashboardNavPresenter('Find interventions')

  get orderedReferrals(): DraftReferralSummaryPresenter[] {
    return this.draftReferrals
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1))
      .map(referral => ({
        serviceUserFullName: PresenterUtils.fullName(referral.serviceUser),
        createdAt: PresenterUtils.govukShortFormattedDate(CalendarDay.britishDayForDate(new Date(referral.createdAt))),
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

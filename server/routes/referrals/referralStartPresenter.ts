import { DraftReferral } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralDataPresenterUtils from './referralDataPresenterUtils'
import CalendarDay from '../../utils/calendarDay'

export default class ReferralStartPresenter {
  constructor(
    private readonly draftReferrals: DraftReferral[],
    private readonly interventionId: string,
    private readonly error: FormValidationError | null = null
  ) {}

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
    errorMessage: ReferralDataPresenterUtils.errorMessage(this.error, 'service-user-crn'),
  }

  readonly hrefStartReferral = `/intervention/${this.interventionId}/refer`
}

interface DraftReferralSummaryPresenter {
  serviceUserFullName: string
  createdAt: string
  url: string
}

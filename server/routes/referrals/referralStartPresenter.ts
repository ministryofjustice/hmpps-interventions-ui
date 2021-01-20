import { DraftReferral } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralDataPresenterUtils from './referralDataPresenterUtils'

export default class ReferralStartPresenter {
  constructor(
    private readonly draftReferrals: DraftReferral[],
    private readonly error: FormValidationError | null = null
  ) {}

  get orderedReferrals(): DraftReferralSummaryPresenter[] {
    return this.draftReferrals
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1))
      .map(referral => ({
        id: referral.id.slice(0, 8), // this is totally arbitrary, and probably meaningless to the user
        createdAt: new Date(referral.createdAt).toLocaleDateString('en-GB'),
        url: `/referrals/${referral.id}/form`,
      }))
  }

  readonly text = {
    noDraftReferrals: 'You do not have any draft referrals at this moment.',
    errorMessage: ReferralDataPresenterUtils.errorMessage(this.error, 'service-user-crn'),
  }
}

interface DraftReferralSummaryPresenter {
  id: string
  createdAt: string
  url: string
}

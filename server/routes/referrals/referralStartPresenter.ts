import { DraftReferral } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralDataPresenterUtils from './referralDataPresenterUtils'
import convertToTitleCase from '../../utils/utils'

export default class ReferralStartPresenter {
  constructor(
    private readonly draftReferrals: DraftReferral[],
    private readonly error: FormValidationError | null = null
  ) {}

  get orderedReferrals(): DraftReferralSummaryPresenter[] {
    return this.draftReferrals
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1))
      .map(referral => ({
        serviceUserFullName: convertToTitleCase(`${referral.serviceUser.firstName} ${referral.serviceUser.lastName}`),
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
  serviceUserFullName: string
  createdAt: string
  url: string
}

import { DeliusServiceUser } from '../../services/communityApiService'
import ServiceUserBannerPresenter from '../shared/serviceUserBannerPresenter'

export default class ReferralCancellationCheckAnswersPresenter {
  constructor(
    private readonly referralId: string,
    private readonly serviceUser: DeliusServiceUser,
    private readonly cancellationReason?: string,
    private readonly cancellationComments?: string
  ) {}

  readonly text = {
    title: 'Referral Cancellation',
    confirmationQuestion: 'Are you sure you want to cancel this referral?',
  }

  readonly confirmCancellationHref = `/probation-practitioner/referrals/${this.referralId}/cancellation/submit`

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly hiddenFields = {
    cancellationReason: this.cancellationReason,
    cancellationComments: this.cancellationComments,
  }
}

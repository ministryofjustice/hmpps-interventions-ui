import a from 'indefinite'
import { DeliusServiceUser } from '../../services/communityApiService'
import { SentReferral, ServiceCategory } from '../../services/interventionsService'

export default class ReferralCancellationPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly serviceUser: DeliusServiceUser
  ) {}

  readonly text = {
    title: 'Referral cancellation',
    information: `You are about to cancel ${this.serviceUser.firstName} ${this.serviceUser.surname}'s referral for ${a(
      this.serviceCategory.name
    )} intervention with ${this.sentReferral.referral.serviceProvider.name}.`,
    additionalCommentsLabel: 'Additional comments (optional):',
  }
}

import a from 'indefinite'
import { DeliusServiceUser } from '../../services/communityApiService'
import { CancellationReason, SentReferral, ServiceCategory } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import ServiceUserBannerPresenter from '../shared/serviceUserBannerPresenter'

export default class ReferralCancellationReasonPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly serviceUser: DeliusServiceUser,
    private readonly cancellationReasons: CancellationReason[],
    private readonly error: FormValidationError | null = null
  ) {}

  readonly text = {
    title: 'Referral cancellation',
    information: `You are about to cancel ${this.serviceUser.firstName} ${this.serviceUser.surname}'s referral for ${a(
      this.serviceCategory.name
    )} intervention with ${this.sentReferral.referral.serviceProvider.name}.`,
    additionalCommentsLabel: 'Additional comments (optional):',
  }

  get cancellationReasonsFields(): { value: string; text: string; checked: boolean }[] {
    return this.cancellationReasons.map(cancellationReason => ({
      value: cancellationReason.code,
      text: cancellationReason.description,
      checked: false,
    }))
  }

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'cancellation-reason')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly checkAnswersHref = `/probation-practitioner/referrals/${this.sentReferral.id}/cancellation/check-your-answers`
}

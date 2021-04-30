import a from 'indefinite'
import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import CancellationReason from '../../models/cancellationReason'
import ServiceCategory from '../../models/serviceCategory'
import SentReferral from '../../models/sentReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

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

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'cancellation-reason')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly checkAnswersHref = `/probation-practitioner/referrals/${this.sentReferral.id}/cancellation/check-your-answers`
}

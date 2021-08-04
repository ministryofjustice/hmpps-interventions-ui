import a from 'indefinite'
import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import CancellationReason from '../../models/cancellationReason'
import SentReferral from '../../models/sentReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import Intervention from '../../models/intervention'
import DraftCancellationData from './draftCancellationData'
import { Draft } from '../../services/draftsService'

export default class ReferralCancellationReasonPresenter {
  constructor(
    private readonly draftCancellation: Draft<DraftCancellationData>,
    private readonly sentReferral: SentReferral,
    private readonly intervention: Intervention,
    private readonly serviceUser: DeliusServiceUser,
    private readonly cancellationReasons: CancellationReason[],
    private readonly error: FormValidationError | null = null
  ) {}

  readonly text = {
    title: 'Referral cancellation',
    information: `You are about to cancel ${this.serviceUser.firstName} ${this.serviceUser.surname}'s referral for ${a(
      this.intervention.contractType.name
    )} intervention with ${this.sentReferral.referral.serviceProvider.name}.`,
    additionalCommentsLabel: 'Additional comments (optional):',
  }

  get cancellationReasonsFields(): { value: string; text: string; checked: boolean }[] {
    return this.cancellationReasons.map(cancellationReason => ({
      value: cancellationReason.code,
      text: cancellationReason.description,
      checked: this.draftCancellation.data.cancellationReason === cancellationReason.code,
    }))
  }

  private readonly utils = new PresenterUtils(null)

  readonly fields = {
    cancellationComments: this.utils.stringValue(
      this.draftCancellation.data.cancellationComments,
      'cancellation-comments'
    ),
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'cancellation-reason')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)
}

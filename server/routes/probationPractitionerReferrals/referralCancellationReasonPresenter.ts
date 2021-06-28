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
    // This property is unused right now, but we’ll shortly make use of it
    // to replay entered data
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
      checked: false,
    }))
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'cancellation-reason')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)
}

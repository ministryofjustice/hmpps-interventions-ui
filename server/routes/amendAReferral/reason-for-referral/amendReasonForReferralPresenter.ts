import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class AmendReasonForReferralPresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: SentReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${this.referral.id}/details`
  }

  readonly text = {
    title: `Update the reason for this referral and further information for the service provider`,
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'amend-reason-for-referral')

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['reason-for-referral'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    reasonForReferral: this.utils.stringValue(this.referral.referral.reasonForReferral, 'amend-reason-for-referral'),
  }
}

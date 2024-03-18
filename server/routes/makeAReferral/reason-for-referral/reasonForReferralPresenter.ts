import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ReasonForReferralPresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: DraftReferral,
    private readonly amendPPDetails: boolean = false,
    private readonly amendReferralDetails: boolean = false,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = this.determinBackUpLink
  }

  readonly text = {
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    title: `Provide the reason for this referral and further information for the service provider`,
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'reason-for-referral')

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['reason-for-referral'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    reasonForReferral: this.utils.stringValue(this.referral.reasonForReferral, 'reason-for-referral'),
  }

  private get determinBackUpLink(): string {
    if (this.amendPPDetails) {
      return `/referrals/${this.referral.id}/check-all-referral-information`
    }
    if (this.amendReferralDetails) {
      return `/probation-practitioner/referrals/${this.referral.id}/details`
    }
    return `/referrals/${this.referral.id}/form`
  }
}

import DraftReferral from '../../../models/draftReferral'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ReferralCreationReasonPresenter {
  readonly backLinkUrl: string

  constructor(
    private readonly referral: DraftReferral,
    private readonly amendPPDetails: boolean | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = amendPPDetails
      ? `/referrals/${referral.id}/check-all-referral-information`
      : `/referrals/${referral.id}/confirm-main-point-of-contact`
  }

  readonly text = {
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    title: 'Enter reason why referral is being made before a probation practitioner has been allocated (if known)',
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    referralCreationReasonBeforeAllocation: this.utils.stringValue(
      this.referral.reasonForReferralCreationBeforeAllocation,
      'referral-creation-reason-before-allocation'
    ),
  }
}

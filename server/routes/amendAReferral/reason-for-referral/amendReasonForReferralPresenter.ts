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
    label: `${this.referral.referral.serviceUser?.firstName} ${this.referral.referral.serviceUser?.lastName} (CRN: ${this.referral.referral.serviceUser?.crn})`,
    title: `Provide the reason for this referral and further information for the service provider`,
  }

  readonly reasonForReferralErrorMessage = PresenterUtils.errorMessage(this.error, 'amend-reason-for-referral')

  readonly reasonForReferralFurtherInformationErrorMessage = PresenterUtils.errorMessage(
    this.error,
    'amend-reason-for-referral-further-information'
  )

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['reason-for-referral'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    reasonForReferral: this.utils.stringValue(this.referral.referral.reasonForReferral, 'amend-reason-for-referral'),
    reasonForReferralFurtherInformation: this.utils.stringValue(
      this.referral.referral.reasonForReferralFurtherInformation,
      'amend-reason-for-referral-further-information'
    ),
  }
}

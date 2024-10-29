import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class AmendProbationPractitionerPhoneNumberPresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: SentReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${this.referral.id}/details`
  }

  readonly text = {
    title: `Update probation practitioner phone number`,
    inputTitle: 'Phone number',
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'amend-probation-practitioner-phone-number')

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['amend-probation-practitioner-phone-number'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ppPhoneNumber: this.utils.stringValue(
      this.referral.referral.ppPhoneNumber,
      'amend-probation-practitioner-phone-number'
    ),
  }
}

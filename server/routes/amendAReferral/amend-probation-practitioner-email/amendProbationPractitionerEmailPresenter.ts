import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class AmendProbationPractitionerEmailPresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: SentReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${this.referral.id}/details`
  }

  readonly text = {
    title: `Update probation practitioner email address`,
    inputTitle: 'Email address',
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'amend-probation-practitioner-email')

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['probation-practitioner-email'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ppEmailAddress: this.utils.stringValue(this.referral.referral.ppEmailAddress, 'amend-probation-practitioner-email'),
  }
}

import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class AmendProbationPractitionerNamePresenter {
  readonly backLinkUrl: string
  private formError: FormValidationError | null

  constructor(
    readonly referral: SentReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${this.referral.id}/details`
    this.formError = error
  }

  readonly text = {
    title: `Update probation practitioner name`,
    inputTitle: 'Full name',
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'amend-probation-practitioner-name')

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['probation-practitioner-name'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ppName: this.utils.stringValue(this.referral.referral.ppName, 'amend-probation-practitioner-name'),
  }
}

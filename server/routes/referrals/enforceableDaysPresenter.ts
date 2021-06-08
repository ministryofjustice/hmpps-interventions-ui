import DraftReferral from '../../models/draftReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class EnforceableDaysPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {}

  readonly text = {
    title: 'How many enforceable days will you use for this service?',
    hint: 'Note: You are setting the maximum number of enforceable days (including RAR days). Any unused days will be given back.',
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'maximum-enforceable-days')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    maximumEnforceableDays: this.utils.stringValue(this.referral.maximumEnforceableDays, 'maximum-enforceable-days'),
  }
}

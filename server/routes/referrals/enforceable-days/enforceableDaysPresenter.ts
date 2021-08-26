import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class EnforceableDaysPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {}

  readonly text = {
    title: 'How many days will you use for this service?',
    hintParagraphs: [
      'You are setting the maximum number of days you want to use and any unused days will be given back. For community orders or suspended sentences, consider how many RAR days to allocate.',
      'Note: Sessions delivered in the community are enforceable.',
    ],
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'maximum-enforceable-days')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    maximumEnforceableDays: this.utils.stringValue(this.referral.maximumEnforceableDays, 'maximum-enforceable-days'),
  }
}

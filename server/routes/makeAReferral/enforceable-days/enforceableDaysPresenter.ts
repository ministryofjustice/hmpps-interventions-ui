import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class EnforceableDaysPresenter {
  constructor(
    private readonly crn: string,
    private readonly maximumEnforceableDays: number | null,
    private readonly firstName: string | null = null,
    private readonly lastName: string | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {}

  readonly text = {
    title: 'How many days will you use for this service?',
    label: `${this.firstName} ${this.lastName} (CRN: ${this.crn})`,
    hintParagraphs: [
      'You are setting the maximum number of days you want to use and any unused days will be given back. For community orders or suspended sentences, consider how many RAR days to allocate.',
      'Note: Sessions delivered in the community are enforceable.',
    ],
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'maximum-enforceable-days')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    maximumEnforceableDays: this.utils.stringValue(this.maximumEnforceableDays, 'maximum-enforceable-days'),
  }
}

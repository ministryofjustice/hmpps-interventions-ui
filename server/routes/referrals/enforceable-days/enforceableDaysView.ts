import { InputArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import EnforceableDaysPresenter from './enforceableDaysPresenter'

export default class EnforceableDaysView {
  constructor(private readonly presenter: EnforceableDaysPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get maximumEnforceableDaysInputArgs(): InputArgs {
    return {
      id: 'maximum-enforceable-days',
      name: 'maximum-enforceable-days',
      classes: 'govuk-input--width-4',
      label: {
        text: this.presenter.text.title,
        classes: 'govuk-label--xl',
        isPageHeading: true,
      },
      hint: {
        html: this.presenter.text.hintParagraphs
          .map(ViewUtils.escape)
          .map(val => `<p>${val}</p>`)
          .join('\n'),
      },
      value: this.presenter.fields.maximumEnforceableDays,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      inputmode: 'numeric',
      pattern: '[0-9]*',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/enforceableDays',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        maximumEnforceableDaysInputArgs: this.maximumEnforceableDaysInputArgs,
      },
    ]
  }
}

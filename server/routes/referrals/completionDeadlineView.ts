import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import ViewUtils from '../../utils/viewUtils'

export default class CompletionDeadlineView {
  constructor(private readonly presenter: CompletionDeadlinePresenter) {}

  private get dateInputArgs(): Record<string, unknown> {
    return {
      id: 'completion-deadline',
      namePrefix: 'completion-deadline',
      fieldset: {
        legend: {
          text: this.presenter.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      hint: {
        text: this.presenter.hint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${this.presenter.hasDayError ? ' govuk-input--error' : ''}`,
          name: 'day',
          value: this.presenter.day,
        },
        {
          classes: `govuk-input--width-2${this.presenter.hasMonthError ? ' govuk-input--error' : ''}`,
          name: 'month',
          value: this.presenter.month,
        },
        {
          classes: `govuk-input--width-4${this.presenter.hasYearError ? ' govuk-input--error' : ''}`,
          name: 'year',
          value: this.presenter.year,
        },
      ],
    }
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/completionDeadline',
      {
        presenter: this.presenter,
        dateInputArgs: this.dateInputArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}

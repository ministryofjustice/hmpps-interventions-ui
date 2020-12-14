import CompletionDeadlinePresenter from './completionDeadlinePresenter'

export default class CompletionDeadlineView {
  constructor(private readonly presenter: CompletionDeadlinePresenter) {}

  private get dateInputArgs(): Record<string, unknown> {
    const errorMessage = this.presenter.errorMessage ? { text: this.presenter.errorMessage } : null

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
      errorMessage,
      items: [
        {
          classes: `govuk-input--width-2${this.presenter.erroredFields.includes('day') ? ' govuk-input--error' : ''}`,
          name: 'day',
          value: this.presenter.day,
        },
        {
          classes: `govuk-input--width-2${this.presenter.erroredFields.includes('month') ? ' govuk-input--error' : ''}`,
          name: 'month',
          value: this.presenter.month,
        },
        {
          classes: `govuk-input--width-4${this.presenter.erroredFields.includes('year') ? ' govuk-input--error' : ''}`,
          name: 'year',
          value: this.presenter.year,
        },
      ],
    }
  }

  private get errorSummaryArgs(): Record<string, unknown> | null {
    if (this.presenter.errorSummary === null) {
      return null
    }

    return {
      titleText: 'There is a problem',
      errorList: this.presenter.errorSummary.errors.map(error => {
        return {
          text: error.message,
          href: `#completion-deadline-${error.linkedField}`,
        }
      }),
    }
  }

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

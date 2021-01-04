import DesiredOutcomesPresenter from './desiredOutcomesPresenter'

export default class DesiredOutcomesView {
  constructor(readonly presenter: DesiredOutcomesPresenter) {}

  get checkboxArgs(): Record<string, unknown> {
    const errorMessage = this.presenter.error ? { text: this.presenter.error.message } : null

    return {
      idPrefix: 'desired-outcomes-ids',
      name: 'desired-outcomes-ids',
      fieldset: {
        legend: {
          text: this.presenter.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      errorMessage,
      hint: {
        text: 'Select all that apply.',
      },
      items: this.presenter.desiredOutcomes.map(desiredOutcome => {
        return {
          value: desiredOutcome.value,
          text: desiredOutcome.text,
          checked: desiredOutcome.checked,
        }
      }),
    }
  }

  get errorSummaryArgs(): Record<string, unknown> | null {
    if (!this.presenter.error) {
      return null
    }

    return {
      titleText: 'There is a problem',
      errorList: [
        {
          text: this.presenter.error.message,
          href: '#desired-outcomes-ids',
        },
      ],
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/desiredOutcomes',
      {
        presenter: this.presenter,
        checkboxArgs: this.checkboxArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}

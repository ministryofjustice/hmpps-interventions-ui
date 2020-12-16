import DesiredOutcomesPresenter from './desiredOutcomesPresenter'

export default class DesiredOutcomesView {
  constructor(readonly presenter: DesiredOutcomesPresenter) {}

  get checkboxArgs(): Record<string, unknown> {
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
      hint: {
        text: 'Select all that apply.',
      },
      items: this.presenter.desiredOutcomes.map(desiredOutcome => {
        return {
          value: desiredOutcome.value,
          text: desiredOutcome.text,
        }
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/desiredOutcomes',
      {
        presenter: this.presenter,
        checkboxArgs: this.checkboxArgs,
      },
    ]
  }
}

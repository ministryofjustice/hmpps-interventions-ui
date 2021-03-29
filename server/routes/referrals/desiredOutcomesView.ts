import { CheckboxesArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import DesiredOutcomesPresenter from './desiredOutcomesPresenter'

export default class DesiredOutcomesView {
  constructor(readonly presenter: DesiredOutcomesPresenter) {}

  get checkboxArgs(): CheckboxesArgs {
    return {
      idPrefix: 'desired-outcomes-ids',
      name: 'desired-outcomes-ids[]',
      fieldset: {
        legend: {
          text: this.presenter.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
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

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

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

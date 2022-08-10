import { CheckboxesArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import AmendDesiredOutcomesForm from './amendDesiredOutcomesForm'
import AmendDesiredOutcomesPresenter from './amendDesiredOutcomesPresenter'

export default class AmendDesiredOutcomesView {
  constructor(readonly presenter: AmendDesiredOutcomesPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get textAreaArgs(): TextareaArgs {
    return {
      name: AmendDesiredOutcomesForm.reasonForChangeId,
      id: AmendDesiredOutcomesForm.reasonForChangeId,
      label: {
        text: this.presenter.reasonTitle,
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.reasonForChangeErrorMessage),
      value: this.presenter.fields.reasonForChange as string,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/desiredOutcomes',
      {
        presenter: this.presenter,
        checkboxArgs: this.checkboxArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        reasonForChangeInputArgs: this.textAreaArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }

  get checkboxArgs(): CheckboxesArgs {
    return {
      idPrefix: 'desired-outcomes-ids',
      name: 'desired-outcomes-ids[]',
      fieldset: {
        legend: {
          text: this.presenter.outcomesTitle,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.outcomesErrorMessage),
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
      attributes: {
        'data-cy': 'desired-outcomes',
      },
    }
  }
}

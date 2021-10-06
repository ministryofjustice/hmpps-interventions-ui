import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import ViewUtils from '../../../utils/viewUtils'
import { DateInputArgs } from '../../../utils/govukFrontendTypes'

export default class CompletionDeadlineView {
  constructor(private readonly presenter: CompletionDeadlinePresenter) {}

  private get dateInputArgs(): DateInputArgs {
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
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.completionDeadline.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${
            this.presenter.fields.completionDeadline.day.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'day',
          value: this.presenter.fields.completionDeadline.day.value,
        },
        {
          classes: `govuk-input--width-2${
            this.presenter.fields.completionDeadline.month.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'month',
          value: this.presenter.fields.completionDeadline.month.value,
        },
        {
          classes: `govuk-input--width-4${
            this.presenter.fields.completionDeadline.year.hasError ? ' govuk-input--error' : ''
          }`,
          name: 'year',
          value: this.presenter.fields.completionDeadline.year.value,
        },
      ],
    }
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/completionDeadline',
      {
        presenter: this.presenter,
        dateInputArgs: this.dateInputArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}

import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import ViewUtils from '../../../utils/viewUtils'
import { DateInputArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'

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
        text: this.presenter.completionDeadlineHint,
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

  private get textAreaArgs(): TextareaArgs | null {
    return this.presenter.sentReferral
      ? {
          name: 'reason-for-change',
          id: 'reason-for-change',
          label: {
            text: `What is the reason for changing the completion date?`,
            classes: 'govuk-label--l',
            isPageHeading: false,
          },
          errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.reasonForChange.errorMessage),
          hint: {
            text: this.presenter.reasonForChangeHint,
          },
          value: this.presenter.fields.reasonForChange.value,
        }
      : null
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.backLinkHref,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/completionDeadline',
      {
        presenter: this.presenter,
        dateInputArgs: this.dateInputArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        textAreaArgs: this.textAreaArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}

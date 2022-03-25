import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import ViewUtils from '../../../utils/viewUtils'
import {DateInputArgs, TextareaArgs} from '../../../utils/govukFrontendTypes'

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

  private get textAreaArgs(): TextareaArgs {
    return {
      name: 'reason-for-change',
      id: 'reason-for-change',
      label: {
        text: "What is the reason for changing the completion date?",
        classes: 'govuk-label--l',
        isPageHeading: true,
      },
      // errorMessage: ViewUtils.govukErrorMessage("error"),
      hint: {
        text: this.presenter.hint,
      },
      // value: this.presenter.value,
    }
  }
  //
  // private readonly addActivityTextareaArgs = {
  //   name: 'description',
  //   id: 'description',
  //   label: {
  //     html: `<h2 class="govuk-heading-m">${ViewUtils.escape(`Activity ${this.presenter.activityNumber}`)}</h2>`,
  //   },
  //   hint: {
  //     text: 'Please write the details of the activity here.',
  //   },
  //   value: this.presenter.existingActivity?.description,
  //   errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
  // }



  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/completionDeadline',
      {
        presenter: this.presenter,
        dateInputArgs: this.dateInputArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        sentReferral: this.presenter.sentReferral,
        textAreaArgs: this.textAreaArgs
      },
    ]
  }
}

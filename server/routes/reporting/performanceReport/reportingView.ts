import { DateInputArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import ReportingPresenter from './reportingPresenter'

export default class ReportingView {
  constructor(private readonly presenter: ReportingPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'reporting/performanceReport/reportingForm',
      {
        presenter: this.presenter,
        fromDateInputArgs: this.fromDateInputArgs,
        toDateInputArgs: this.toDateInputArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get fromDateInputArgs(): DateInputArgs {
    return {
      id: 'from-date',
      namePrefix: 'from-date',
      fieldset: {
        legend: {
          text: 'From date',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: this.presenter.text.hint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.fromDate.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${this.presenter.fields.fromDate.day.hasError ? ' govuk-input--error' : ''}`,
          name: 'day',
          value: this.presenter.fields.fromDate.day.value,
        },
        {
          classes: `govuk-input--width-2${this.presenter.fields.fromDate.month.hasError ? ' govuk-input--error' : ''}`,
          name: 'month',
          value: this.presenter.fields.fromDate.month.value,
        },
        {
          classes: `govuk-input--width-4${this.presenter.fields.fromDate.year.hasError ? ' govuk-input--error' : ''}`,
          name: 'year',
          value: this.presenter.fields.fromDate.year.value,
        },
      ],
    }
  }

  get toDateInputArgs(): DateInputArgs {
    return {
      id: 'to-date',
      namePrefix: 'to-date',
      fieldset: {
        legend: {
          text: 'To date',
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: this.presenter.text.hint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.toDate.errorMessage),
      items: [
        {
          classes: `govuk-input--width-2${this.presenter.fields.toDate.day.hasError ? ' govuk-input--error' : ''}`,
          name: 'day',
          value: this.presenter.fields.toDate.day.value,
        },
        {
          classes: `govuk-input--width-2${this.presenter.fields.toDate.month.hasError ? ' govuk-input--error' : ''}`,
          name: 'month',
          value: this.presenter.fields.toDate.month.value,
        },
        {
          classes: `govuk-input--width-4${this.presenter.fields.toDate.year.hasError ? ' govuk-input--error' : ''}`,
          name: 'year',
          value: this.presenter.fields.toDate.year.value,
        },
      ],
    }
  }
}

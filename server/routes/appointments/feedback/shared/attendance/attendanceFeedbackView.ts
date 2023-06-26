import { BackLinkArgs, TextareaArgs } from '../../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../../utils/viewUtils'
import AttendanceFeedbackPresenter from './attendanceFeedbackPresenter'

export default class AttendanceFeedbackView {
  constructor(private readonly presenter: AttendanceFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.appointmentSummary.appointmentSummaryList)

  private radioButtonArgs(noHtml: string): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'attended',
      name: 'attended',
      attributes: { 'data-cy': 'supplier-assessment-attendance-radios' },
      fieldset: {
        legend: {
          text: this.presenter.text.attendanceQuestion,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: this.presenter.text.attendanceQuestionHint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.attended.errorMessage),
      items: [
        {
          value: this.presenter.attendanceResponses.yes.value,
          text: this.presenter.attendanceResponses.yes.text,
          checked: this.presenter.fields.attended.value === this.presenter.attendanceResponses.yes.value,
        },
        {
          value: this.presenter.attendanceResponses.late.value,
          text: this.presenter.attendanceResponses.late.text,
          checked: this.presenter.fields.attended.value === this.presenter.attendanceResponses.late.value,
        },
        {
          value: this.presenter.attendanceResponses.no.value,
          text: this.presenter.attendanceResponses.no.text,
          checked: this.presenter.fields.attended.value === this.presenter.attendanceResponses.no.value,
          conditional: {
            html: noHtml,
          },
        },
      ],
    }
  }

  private get attendanceFailureInformationTextAreaArgs(): TextareaArgs {
    return {
      name: 'attendance-failure-information',
      id: 'attendance-failure-information',
      label: {
        text: this.presenter.text.attendanceFailureInformationQuestion,
        classes: 'govuk-body govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      value: this.presenter.fields.attendanceFailureInformation.value,
    }
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get backLinkArgs(): BackLinkArgs | null {
    if (!this.presenter.backLinkHref) {
      return null
    }

    return {
      href: this.presenter.backLinkHref,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/shared/postSessionAttendanceFeedback',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
        radioButtonArgs: this.radioButtonArgs.bind(this),
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: this.backLinkArgs,
        attendanceFailureInformationTextAreaArgs: this.attendanceFailureInformationTextAreaArgs,
      },
    ]
  }
}

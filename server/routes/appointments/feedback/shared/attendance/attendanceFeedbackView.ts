import { BackLinkArgs, TextareaArgs } from '../../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../../utils/viewUtils'
import AttendanceFeedbackPresenter from './attendanceFeedbackPresenter'

export default class AttendanceFeedbackView {
  constructor(private readonly presenter: AttendanceFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.appointmentSummary.appointmentSummaryList)

  private get radioButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'attended',
      name: 'attended',
      attributes: { 'data-cy': 'supplier-assessment-attendance-radios' },
      fieldset: {
        legend: {
          text: this.presenter.text.attendanceQuestion,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      hint: {
        text: this.presenter.text.attendanceQuestionHint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.attended.errorMessage),
      items: this.presenter.attendanceResponses.map(response => {
        return {
          value: response.value,
          text: response.text,
          checked: response.checked,
        }
      }),
    }
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get textAreaArgs(): TextareaArgs {
    return {
      name: 'additional-attendance-information',
      id: 'additional-attendance-information',
      label: {
        text: this.presenter.text.additionalAttendanceInformationLabel,
        classes: 'govuk-label--s govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      value: this.presenter.fields.additionalAttendanceInformation.value,
    }
  }

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
        radioButtonArgs: this.radioButtonArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        textAreaArgs: this.textAreaArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}
import { BackLinkArgs, TextareaArgs } from '../../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../../utils/viewUtils'
import AttendanceFeedbackPresenter from './attendanceFeedbackPresenter'

export default class AttendanceFeedbackView {
  constructor(private readonly presenter: AttendanceFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.appointmentSummary.appointmentSummaryList)
  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get backLinkArgs(): BackLinkArgs | null {
    if (!this.presenter.backLinkHref) {
      return null
    }

    return {
      href: this.presenter.backLinkHref,
    }
  }

  private didSessionHappenRadioButtonArgs(noHtml: string): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'did-session-happen',
      name: 'did-session-happen',
      attributes: { 'data-cy': 'did-session-happen-radios' },
      fieldset: {
        legend: {
          text: this.presenter.text.didSessionHappenQuestion,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: this.presenter.text.didSessionHappenQuestionHint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.didSessionHappen.errorMessage),
      items: [
        {
          value: this.presenter.didSessionHappenResponses.yes.value,
          text: this.presenter.didSessionHappenResponses.yes.text,
          checked: this.presenter.fields.didSessionHappen.value === true,
        },
        {
          value: this.presenter.didSessionHappenResponses.no.value,
          text: this.presenter.didSessionHappenResponses.no.text,
          checked: this.presenter.fields.didSessionHappen.value === false,
          conditional: {
            html: noHtml,
          },
        },
      ],
    }
  }

  private get attendanceRadioButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'attended',
      name: 'attended',
      attributes: { 'data-cy': 'supplier-assessment-attendance-radios' },
      fieldset: {
        legend: {
          text: this.presenter.text.attendanceQuestion,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--s',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.attended.errorMessage),
      items: [
        {
          value: this.presenter.attendanceResponses.yes.value,
          text: this.presenter.attendanceResponses.yes.text,
          checked: this.presenter.fields.attended.value === this.presenter.attendanceResponses.yes.value,
        },
        {
          value: this.presenter.attendanceResponses.no.value,
          text: this.presenter.attendanceResponses.no.text,
          checked: this.presenter.fields.attended.value === this.presenter.attendanceResponses.no.value,
        },
        {
          value: this.presenter.attendanceResponses.dontKnow.value,
          text: this.presenter.attendanceResponses.dontKnow.text,
          checked: this.presenter.fields.attended.value === this.presenter.attendanceResponses.dontKnow.value,
        },
      ],
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/shared/postSessionAttendanceFeedback',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
        didSessionHappenRadioButtonArgs: this.didSessionHappenRadioButtonArgs.bind(this),
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: this.backLinkArgs,
        attendanceRadioButtonArgs: this.attendanceRadioButtonArgs,
      },
    ]
  }
}

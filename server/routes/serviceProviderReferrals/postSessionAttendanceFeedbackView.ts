import { TextareaArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import PostSessionAttendanceFeedbackPresenter from './postSessionAttendanceFeedbackPresenter'

export default class PostSessionAttendanceFeedbackView {
  constructor(private readonly presenter: PostSessionAttendanceFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  private get radioButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'attended',
      name: 'attended',
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

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionAttendanceFeedback',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.presenter.serviceUserBannerPresenter.serviceUserBannerArgs,
        summaryListArgs: this.summaryListArgs,
        radioButtonArgs: this.radioButtonArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        textAreaArgs: this.textAreaArgs,
      },
    ]
  }
}

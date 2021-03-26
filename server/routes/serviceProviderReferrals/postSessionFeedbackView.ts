import ViewUtils from '../../utils/viewUtils'
import PostSessionFeedbackPresenter from './postSessionFeedbackPresenter'

export default class PostSessionFeedbackView {
  constructor(private readonly presenter: PostSessionFeedbackPresenter) {}

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
          classes: 'govuk-fieldset__legend--m',
        },
      },
      items: this.presenter.attendanceResponses.map(response => {
        return {
          value: response.value,
          text: response.text,
          checked: response.checked,
        }
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionFeedback',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.presenter.serviceUserBannerPresenter.serviceUserBannerArgs,
        summaryListArgs: this.summaryListArgs,
        radioButtonArgs: this.radioButtonArgs,
      },
    ]
  }
}

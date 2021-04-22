import ViewUtils from '../../utils/viewUtils'
import SubmittedPostSessionFeedbackPresenter from './submittedPostSessionFeedbackPresenter'

export default class SubmittedPostSessionFeedbackView {
  constructor(private readonly presenter: SubmittedPostSessionFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/viewSubmittedPostSessionFeedback',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.presenter.serviceUserBannerPresenter.serviceUserBannerArgs,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

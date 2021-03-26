import ViewUtils from '../../utils/viewUtils'
import PostSessionFeedbackPresenter from './postSessionFeedbackPresenter'

export default class PostSessionFeedbackView {
  constructor(private readonly presenter: PostSessionFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionFeedback',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.presenter.serviceUserBannerPresenter.serviceUserBannerArgs,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

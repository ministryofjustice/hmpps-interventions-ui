import ViewUtils from '../../utils/viewUtils'
import PostSessionFeedbackCheckAnswersPresenter from './postSessionFeedbackCheckAnswersPresenter'

export default class PostSessionFeedbackCheckAnswersView {
  constructor(private readonly presenter: PostSessionFeedbackCheckAnswersPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionFeedbackCheckAnswers',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.presenter.serviceUserBannerPresenter.serviceUserBannerArgs,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

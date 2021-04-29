import ViewUtils from '../../utils/viewUtils'
import ServiceUserBannerView from '../shared/serviceUserBannerView'
import PostSessionFeedbackCheckAnswersPresenter from './postSessionFeedbackCheckAnswersPresenter'

export default class PostSessionFeedbackCheckAnswersView {
  constructor(private readonly presenter: PostSessionFeedbackCheckAnswersPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  private readonly serviceUserBannerView = new ServiceUserBannerView(this.presenter.serviceUserBannerPresenter)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionFeedbackCheckAnswers',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
        ...this.serviceUserBannerView.locals,
      },
    ]
  }
}

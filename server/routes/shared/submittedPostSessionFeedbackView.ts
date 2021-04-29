import ViewUtils from '../../utils/viewUtils'
import ServiceUserBannerView from './serviceUserBannerView'
import SubmittedPostSessionFeedbackPresenter from './submittedPostSessionFeedbackPresenter'

export default class SubmittedPostSessionFeedbackView {
  constructor(private readonly presenter: SubmittedPostSessionFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  private readonly serviceUserBannerView = new ServiceUserBannerView(this.presenter.serviceUserBannerPresenter)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/viewSubmittedPostSessionFeedback',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
        ...this.serviceUserBannerView.locals,
      },
    ]
  }
}

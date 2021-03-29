import ViewUtils from '../../utils/viewUtils'
import PostSessionFeedbackConfirmationPresenter from './postSessionFeedbackConfirmationPresenter'

export default class PostSessionFeedbackConfirmationView {
  constructor(private readonly presenter: PostSessionFeedbackConfirmationPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.summary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionFeedbackConfirmation',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

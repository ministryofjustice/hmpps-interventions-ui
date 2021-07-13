import ViewUtils from '../../../../utils/viewUtils'
import SubmittedFeedbackPresenter from './submittedFeedbackPresenter'

export default class SubmittedFeedbackView {
  constructor(private readonly presenter: SubmittedFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/viewSubmittedPostSessionFeedback',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

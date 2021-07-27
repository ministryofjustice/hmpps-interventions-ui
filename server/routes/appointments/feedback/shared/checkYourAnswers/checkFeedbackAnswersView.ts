import ViewUtils from '../../../../../utils/viewUtils'
import CheckFeedbackAnswersPresenter from './checkFeedbackAnswersPresenter'

export default class CheckFeedbackAnswersView {
  constructor(private readonly presenter: CheckFeedbackAnswersPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/shared/postSessionFeedbackCheckAnswers',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

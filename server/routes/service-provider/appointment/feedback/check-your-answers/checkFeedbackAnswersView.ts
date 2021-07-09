import ViewUtils from '../../../../../utils/viewUtils'
import ActionPlanPostSessionFeedbackCheckAnswersPresenter from '../../../action-plan/appointment/post-session-feedback/check-your-answers/actionPlanPostSessionFeedbackCheckAnswersPresenter'

export default class CheckFeedbackAnswersView {
  constructor(private readonly presenter: ActionPlanPostSessionFeedbackCheckAnswersPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionFeedbackCheckAnswers',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

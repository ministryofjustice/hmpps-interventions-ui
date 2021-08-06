import { BackLinkArgs } from '../../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../../utils/viewUtils'
import CheckFeedbackAnswersPresenter from './checkFeedbackAnswersPresenter'

export default class CheckFeedbackAnswersView {
  constructor(private readonly presenter: CheckFeedbackAnswersPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.sessionDetailsSummary)

  private get backLinkArgs(): BackLinkArgs {
    return {
      href: this.presenter.backLinkHref,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/shared/postSessionFeedbackCheckAnswers',
      {
        presenter: this.presenter,
        feedbackAnswersPresenter: this.presenter.feedbackAnswersPresenter,
        summaryListArgs: this.summaryListArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}

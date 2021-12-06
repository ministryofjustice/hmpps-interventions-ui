import { BackLinkArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import SubmittedFeedbackPresenter from './submittedFeedbackPresenter'

export default class SubmittedFeedbackView {
  constructor(private readonly presenter: SubmittedFeedbackPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.appointmentSummary.appointmentSummaryList)

  private get backLinkArgs(): BackLinkArgs {
    return {
      href: this.presenter.backLinkHref,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/viewSubmittedPostSessionFeedback',
      {
        presenter: this.presenter,
        feedbackAnswersPresenter: this.presenter.feedbackAnswersPresenter,
        summaryListArgs: this.summaryListArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}
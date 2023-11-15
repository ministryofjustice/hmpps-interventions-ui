import { BackLinkArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import SubmittedFeedbackPresenter from './submittedFeedbackPresenter'

export default class SubmittedFeedbackView {
  constructor(private readonly presenter: SubmittedFeedbackPresenter) {}

  private get backLinkArgs(): BackLinkArgs {
    return {
      href: this.presenter.backLinkHref,
    }
  }

  private get sessionDetailsSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.appointmentSummary.appointmentSummaryList,
      this.presenter.sessionDetailsHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private get sessionAttendanceSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.sessionAttendanceSummaryListArgs,
      this.presenter.sessionAttendanceHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private get sessionFeedbackSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.sessionFeedbackSummaryListArgs,
      this.presenter.sessionFeedbackHeading,
      { showBorders: true, showTitle: true }
    )
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/viewSubmittedPostSessionFeedback',
      {
        presenter: this.presenter,
        feedbackAnswersPresenter: this.presenter.feedbackAnswersPresenter,
        backLinkArgs: this.backLinkArgs,
        sessionDetailsSummaryListArgs: this.sessionDetailsSummaryListArgs,
        sessionAttendanceSummaryListArgs: this.sessionAttendanceSummaryListArgs,
        sessionFeedbackSummaryListArgs: this.sessionFeedbackSummaryListArgs,
      },
    ]
  }
}

import { BackLinkArgs } from '../../../../../utils/govukFrontendTypes'
import CheckFeedbackAnswersPresenter from './checkFeedbackAnswersPresenter'
import ViewUtils from '../../../../../utils/viewUtils'

export default class CheckFeedbackAnswersView {
  constructor(private readonly presenter: CheckFeedbackAnswersPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.appointmentSummary.appointmentSummaryList)

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
      'appointments/feedback/shared/postSessionFeedbackCheckAnswers',
      {
        presenter: this.presenter,
        feedbackAnswersPresenter: this.presenter.feedbackAnswersPresenter,
        summaryListArgs: this.summaryListArgs,
        backLinkArgs: this.backLinkArgs,
        sessionDetailsSummaryListArgs: this.sessionDetailsSummaryListArgs,
        sessionAttendanceSummaryListArgs: this.sessionAttendanceSummaryListArgs,
        sessionFeedbackSummaryListArgs: this.sessionFeedbackSummaryListArgs,
      },
    ]
  }
}

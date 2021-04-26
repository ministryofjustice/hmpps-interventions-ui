import ViewUtils from '../../utils/viewUtils'
import EndOfServiceReportAnswersPresenter, {
  EndOfServiceReportAchievementLevelStyle,
} from './endOfServiceReportAnswersPresenter'

export default class EndOfServiceReportAnswersView {
  constructor(private readonly presenter: EndOfServiceReportAnswersPresenter) {}

  private readonly interventionSummarySummaryListArgs = ViewUtils.summaryListArgs(this.presenter.interventionSummary)

  private readonly achievementLevelTagClass = (style: EndOfServiceReportAchievementLevelStyle) => {
    switch (style) {
      case 'ACHIEVED':
        return 'govuk-tag--green'
      case 'PARTIALLY_ACHIEVED':
        return 'govuk-tag--blue'
      case 'NOT_ACHIEVED':
        return 'govuk-tag--red'
      default:
        return ''
    }
  }

  readonly locals = {
    endOfServiceReportAnswersPresenter: this.presenter,
    interventionSummarySummaryListArgs: this.interventionSummarySummaryListArgs,
    achievementLevelTagClass: this.achievementLevelTagClass,
  }
}

import ViewUtils from '../../utils/viewUtils'
import EndOfServiceReportCheckAnswersPresenter, {
  EndOfServiceReportAchievementLevelStyle,
} from './endOfServiceReportCheckAnswersPresenter'

export default class EndOfServiceReportCheckAnswersView {
  constructor(private readonly presenter: EndOfServiceReportCheckAnswersPresenter) {}

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

  readonly renderArgs: [string, Record<string, unknown>] = [
    'serviceProviderReferrals/endOfServiceReport/checkAnswers',
    {
      presenter: this.presenter,
      interventionSummarySummaryListArgs: this.interventionSummarySummaryListArgs,
      achievementLevelTagClass: this.achievementLevelTagClass,
    },
  ]
}

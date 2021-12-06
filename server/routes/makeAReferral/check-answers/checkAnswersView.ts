import CheckAnswersPresenter from './checkAnswersPresenter'
import ViewUtils from '../../../utils/viewUtils'

export default class CheckAnswersView {
  constructor(private readonly presenter: CheckAnswersPresenter) {}

  private readonly serviceUserDetailsSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.serviceUserDetailsSection.summary
  )

  private readonly needsAndRequirementsSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.needsAndRequirementsSection.summary
  )

  private readonly referralDetailsSections = this.presenter.referralDetailsSections.map(section => ({
    title: section.title,
    summaryListArgs: ViewUtils.summaryListArgs(section.summary),
  }))

  private readonly serviceCategoriesSummaryListArgs = this.presenter.serviceCategoriesSummary
    ? ViewUtils.summaryListArgs(this.presenter.serviceCategoriesSummary)
    : null

  private readonly sentenceInformationSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.sentenceInformationSummary
  )

  private readonly completionDeadlineSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.completionDeadlineSection.summary
  )

  private readonly enforceableDaysSummaryListArgs = ViewUtils.summaryListArgs(this.presenter.enforceableDaysSummary)

  private readonly furtherInformationSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.furtherInformationSummary
  )

  private readonly riskInformationSummaryListArgs = ViewUtils.summaryListArgs(this.presenter.riskSection.summary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/checkAnswers',
      {
        presenter: this.presenter,
        serviceUserDetailsSummaryListArgs: this.serviceUserDetailsSummaryListArgs,
        needsAndRequirementsSummaryListArgs: this.needsAndRequirementsSummaryListArgs,
        referralDetailsSections: this.referralDetailsSections,
        serviceCategoriesSummaryListArgs: this.serviceCategoriesSummaryListArgs,
        sentenceInformationSummaryListArgs: this.sentenceInformationSummaryListArgs,
        enforceableDaysSummaryListArgs: this.enforceableDaysSummaryListArgs,
        completionDeadlineSummaryListArgs: this.completionDeadlineSummaryListArgs,
        furtherInformationSummaryListArgs: this.furtherInformationSummaryListArgs,
        riskInformationSummaryListArgs: this.riskInformationSummaryListArgs,
      },
    ]
  }
}
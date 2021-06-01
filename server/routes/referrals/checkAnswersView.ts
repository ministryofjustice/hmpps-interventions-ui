import CheckAnswersPresenter from './checkAnswersPresenter'
import ViewUtils from '../../utils/viewUtils'

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

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/checkAnswers',
      {
        presenter: this.presenter,
        serviceUserDetailsSummaryListArgs: this.serviceUserDetailsSummaryListArgs,
        needsAndRequirementsSummaryListArgs: this.needsAndRequirementsSummaryListArgs,
        referralDetailsSections: this.referralDetailsSections,
      },
    ]
  }
}

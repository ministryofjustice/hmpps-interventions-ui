import CheckAnswersPresenter from './checkAnswersPresenter'
import ViewUtils from '../../utils/viewUtils'

export default class CheckAnswersView {
  constructor(private readonly presenter: CheckAnswersPresenter) {}

  private readonly serviceUserDetailsSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.serviceUserDetailsSection.summary
  )

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/checkAnswers',
      { presenter: this.presenter, serviceUserDetailsSummaryListArgs: this.serviceUserDetailsSummaryListArgs },
    ]
  }
}

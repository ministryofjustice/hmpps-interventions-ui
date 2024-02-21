import ViewUtils from '../../../utils/viewUtils'
import ConfirmProbationPractitionerDetailsPresenter from './confirmProbationPractitionerDetailsPresenter'

export default class ConfirmProbationPractitionerDetailsView {
  constructor(private readonly presenter: ConfirmProbationPractitionerDetailsPresenter) {}

  private get summaryListArgs() {
    return ViewUtils.summaryListArgs(this.presenter.summary)
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/confirmProbationPractitionerDetails',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}

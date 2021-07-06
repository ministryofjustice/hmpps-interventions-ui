import ViewUtils from '../../../../utils/viewUtils'
import EndOfServiceReportConfirmationPresenter from './endOfServiceReportConfirmationPresenter'

export default class EndOfServiceReportConfirmationView {
  constructor(private readonly presenter: EndOfServiceReportConfirmationPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.summary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/endOfServiceReport/confirmation',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

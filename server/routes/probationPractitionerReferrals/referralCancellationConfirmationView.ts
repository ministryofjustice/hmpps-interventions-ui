import ViewUtils from '../../utils/viewUtils'
import ReferralCancellationConfirmationPresenter from './referralCancellationConfirmationPresenter'

export default class ReferralCancellationConfirmationView {
  constructor(private readonly presenter: ReferralCancellationConfirmationPresenter) {}

  private get summaryListArgs() {
    return ViewUtils.summaryListArgs(this.presenter.serviceUserSummary)
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralCancellationConfirmation',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

import ViewUtils from '../../../../utils/viewUtils'
import ReferralWithdrawalConfirmationPresenter from './referralWithdrawalConfirmationPresenter'

export default class ReferralWithdrawalConfirmationView {
  constructor(private readonly presenter: ReferralWithdrawalConfirmationPresenter) {}

  private get summaryListArgs() {
    return ViewUtils.summaryListArgs(this.presenter.serviceUserSummary)
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralWithdrawalConfirmation',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

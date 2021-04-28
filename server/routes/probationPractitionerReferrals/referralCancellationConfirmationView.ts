import ViewUtils from '../../utils/viewUtils'
import ReferralCancellationConfirmationPresenter from './referralCancellationConfirmationPresenter'

export default class ReferralCancellationConfirmationView {
  constructor(private readonly presenter: ReferralCancellationConfirmationPresenter) {}

  private get summaryListArgs() {
    return ViewUtils.summaryListArgs(this.presenter.serviceUserSummary)
  }

  private get serviceUserBannerArgs() {
    return this.presenter.serviceUserBannerPresenter.serviceUserBannerArgs
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralCancellationConfirmation',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.serviceUserBannerArgs,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}

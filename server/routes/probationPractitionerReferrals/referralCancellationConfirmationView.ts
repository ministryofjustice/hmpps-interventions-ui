import ViewUtils from '../../utils/viewUtils'
import ServiceUserBannerView from '../shared/serviceUserBannerView'
import ReferralCancellationConfirmationPresenter from './referralCancellationConfirmationPresenter'

export default class ReferralCancellationConfirmationView {
  constructor(private readonly presenter: ReferralCancellationConfirmationPresenter) {}

  private get summaryListArgs() {
    return ViewUtils.summaryListArgs(this.presenter.serviceUserSummary)
  }

  private readonly serviceUserBannerView = new ServiceUserBannerView(this.presenter.serviceUserBannerPresenter)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralCancellationConfirmation',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
        ...this.serviceUserBannerView.locals,
      },
    ]
  }
}

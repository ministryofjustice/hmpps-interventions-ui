import ShowReferralPresenter from './showReferralPresenter'
import ViewUtils from '../../utils/viewUtils'

export default class ShowReferralView {
  constructor(private readonly presenter: ShowReferralPresenter) {}

  private readonly probationPractitionerSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.probationPractitionerDetails
  )

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/showReferral',
      {
        presenter: this.presenter,
        probationPractitionerSummaryListArgs: this.probationPractitionerSummaryListArgs,
        serviceUserNotificationBannerArgs: this.presenter.serviceUserNotificationBannerArgs,
      },
    ]
  }
}

import ServiceUserBannerView from '../shared/serviceUserBannerView'
import ReferralCancellationCheckAnswersPresenter from './referralCancellationCheckAnswersPresenter'

export default class ReferralCancellationCheckAnswersView {
  constructor(private readonly presenter: ReferralCancellationCheckAnswersPresenter) {}

  private readonly serviceUserBannerView = new ServiceUserBannerView(this.presenter.serviceUserBannerPresenter)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralCancellationCheckAnswers',
      {
        presenter: this.presenter,
        hiddenFields: this.presenter.hiddenFields,
        ...this.serviceUserBannerView.locals,
      },
    ]
  }
}

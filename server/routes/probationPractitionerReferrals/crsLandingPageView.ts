import CrsLandingPagePresenter from './crsLandingPagePresenter'
import { serviceOutageBannerArgs } from '../../utils/viewUtils'

export default class CrsLandingPageView {
  constructor(private readonly presenter: CrsLandingPagePresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'crsHome/index',
      {
        findAndMake: this.presenter.findInterventionsUrl,
        viewReferral: this.presenter.viewReferral,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        pageHeading: this.presenter.pageHeading,
        serviceOutageBannerArgs: serviceOutageBannerArgs(
          this.presenter.closeHref,
          !this.presenter.disableDowntimeBanner
        ),
      },
    ]
  }
}

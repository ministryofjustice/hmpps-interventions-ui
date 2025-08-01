import CrsLandingPagePresenter from './crsLandingPagePresenter'

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
      },
    ]
  }
}

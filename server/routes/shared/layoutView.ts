import ServiceUserBannerView from './serviceUserBannerView'
import LayoutPresenter from './layoutPresenter'
import config from '../../config'

export interface PageContentView {
  renderArgs: [string, Record<string, unknown>]
}

export default class LayoutView {
  constructor(private readonly presenter: LayoutPresenter, private readonly content: PageContentView) {}

  private readonly serviceUserBannerView = this.presenter.serviceUserBannerPresenter
    ? new ServiceUserBannerView(this.presenter.serviceUserBannerPresenter)
    : null

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      this.content.renderArgs[0],
      {
        ...(this.serviceUserBannerView?.locals ?? {}),
        headerPresenter: this.presenter.headerPresenter,
        googleAnalyticsTrackingId: config.googleAnalyticsTrackingId,
        ...this.content.renderArgs[1],
      },
    ]
  }
}
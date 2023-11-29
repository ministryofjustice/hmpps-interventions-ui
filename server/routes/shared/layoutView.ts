import ServiceUserBannerView from './serviceUserBannerView'
import LayoutPresenter from './layoutPresenter'
import config from '../../config'
import { NotificationBannerArgs } from '../../utils/govukFrontendTypes'

export interface PageContentView {
  renderArgs: [string, Record<string, unknown>]
}

export default class LayoutView {
  constructor(
    private readonly presenter: LayoutPresenter,
    private readonly content: PageContentView
  ) {}

  private readonly serviceUserBannerView = this.presenter.serviceUserBannerPresenter
    ? new ServiceUserBannerView(this.presenter.serviceUserBannerPresenter)
    : null

  get whatsNewBannerArgs(): NotificationBannerArgs {
    const html = `<p class="govuk-notification-banner__heading">${this.presenter.whatsNewBanner?.heading}</p>
                  <p class="govuk-body">
                    ${this.presenter.whatsNewBanner?.text} 
                    <a class="govuk-notification-banner__link" href='${this.presenter.whatsNewBanner?.link}'>
                      ${this.presenter.whatsNewBanner?.linkText}
                    </a>
                  </p>
                  <p><a class="govuk-notification-banner__link" href=${this.presenter.dismissWhatsNewBannerHref}>Dismiss</a></p>`
    return {
      titleText: 'What’s new',
      html,
      classes: 'govuk-notification-banner--info',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      this.content.renderArgs[0],
      {
        ...(this.serviceUserBannerView?.locals ?? {}),
        headerPresenter: this.presenter.headerPresenter,
        googleAnalyticsTrackingId: config.googleAnalyticsTrackingId,
        ...this.content.renderArgs[1],
        showWhatsNewBanner: this.presenter.showWhatsNewBanner,
        whatsNewBannerArgs: this.whatsNewBannerArgs,
      },
    ]
  }
}

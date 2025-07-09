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

  // Add a static config flag to control the "What's New" banner globally
  private static readonly whatsNewBannerEnabled: boolean = config.whatsNewBannerEnabled !== false

  private readonly serviceUserBannerView = this.presenter.serviceUserBannerPresenter
    ? new ServiceUserBannerView(this.presenter.serviceUserBannerPresenter)
    : null

  get whatsNewBannerArgs(): NotificationBannerArgs | null {
    // If the feature is disabled, never show the banner
    if (!LayoutView.whatsNewBannerEnabled) return null
    const html = `<div class="refer-and-monitor__max-width">
                    <p class="govuk-notification-banner__heading">${this.presenter.whatsNewBanner?.heading}</p>
                    <p class="govuk-body">
                      ${this.presenter.whatsNewBanner?.text} 
                      <a class="govuk-notification-banner__link" href='${this.presenter.whatsNewBanner?.link}'>
                        ${this.presenter.whatsNewBanner?.linkText}
                      </a>
                    </p>
                    <p><a class="govuk-notification-banner__link" href=${this.presenter.dismissWhatsNewBannerHref}>Dismiss</a></p>
                  </div>`
    return {
      titleText: 'What’s new',
      html,
      classes: 'govuk-notification-banner--info',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    // If the feature is disabled, never show the banner
    const showWhatsNewBanner = LayoutView.whatsNewBannerEnabled && this.presenter.showWhatsNewBanner
    return [
      this.content.renderArgs[0],
      {
        ...(this.serviceUserBannerView?.locals ?? {}),
        headerPresenter: this.presenter.headerPresenter,
        googleAnalyticsTrackingId: config.googleAnalyticsTrackingId,
        ...this.content.renderArgs[1],
        showWhatsNewBanner,
        whatsNewBannerArgs: this.whatsNewBannerArgs,
      },
    ]
  }
}

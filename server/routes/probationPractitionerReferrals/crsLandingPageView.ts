import { NotificationBannerArgs } from '../../utils/govukFrontendTypes'
import CrsLandingPagePresenter from './crsLandingPagePresenter'

export default class CrsLandingPageView {
  constructor(private readonly presenter: CrsLandingPagePresenter) {}

  get serviceOutageBannerArgs(): NotificationBannerArgs {
    const text =
      'Refer and monitor an intervention will be unavailable between 9pm on Friday 19 September and 7am on Monday 22 September. This is due to planned maintenance in NDelius.'
    const subHeading = 'Planned Downtime'

    const html = `<div class="refer-and-monitor__max-width">
                  <p class="govuk-notification-banner__heading"> ${subHeading}</p>
                  <p class="govuk-body">${text}</p>
                  <p><a class="govuk-notification-banner__link" href= ${this.presenter.closeHref}>Close</a></p></div>`
    return {
      titleText: 'Downtime',
      html,
      classes: 'govuk-notification-banner--info',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'crsHome/index',
      {
        findAndMake: this.presenter.findInterventionsUrl,
        viewReferral: this.presenter.viewReferral,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        pageHeading: this.presenter.pageHeading,
        disableDowntimeBanner: this.presenter.disableDowntimeBanner,
        serviceOutageBannerArgs: this.serviceOutageBannerArgs,
      },
    ]
  }
}

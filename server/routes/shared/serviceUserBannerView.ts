import { NotificationBannerArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'

export default class ServiceUserBannerView {
  constructor(private readonly presenter: ServiceUserBannerPresenter) {}

  private readonly serviceUserNotificationBannerArgs: NotificationBannerArgs = {
    titleText: 'Service user details',
    html:
      `<p class="govuk-notification-banner__heading">${ViewUtils.escape(this.presenter.name)}<p>` +
      `<p>Date of birth: ${ViewUtils.escape(this.presenter.dateOfBirth)}</p>` +
      `<p class="govuk-body">${ViewUtils.escape(this.presenter.serviceUserMobile)} | ${ViewUtils.escape(
        this.presenter.serviceUserEmail
      )}</p>`,
  }

  readonly locals = {
    serviceUserNotificationBannerArgs: this.serviceUserNotificationBannerArgs,
  }
}

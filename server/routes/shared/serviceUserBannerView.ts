import ServiceUserBannerPresenter from './serviceUserBannerPresenter'

export default class ServiceUserBannerView {
  constructor(private readonly presenter: ServiceUserBannerPresenter) {}

  readonly locals = {
    serviceUserBannerPresenter: this.presenter,
  }
}

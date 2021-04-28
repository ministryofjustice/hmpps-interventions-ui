import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'

export default class LayoutPresenter {
  constructor(private readonly serviceUser: DeliusServiceUser | null) {}

  readonly serviceUserBannerPresenter = this.serviceUser ? new ServiceUserBannerPresenter(this.serviceUser) : null
}

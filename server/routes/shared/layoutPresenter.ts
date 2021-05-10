import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import HeaderPresenter from './headerPresenter'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'
import LoggedInUser from '../../models/loggedInUser'

export default class LayoutPresenter {
  constructor(private readonly loggedInUser: LoggedInUser | null, readonly serviceUser: DeliusServiceUser | null) {}

  readonly serviceUserBannerPresenter = this.serviceUser ? new ServiceUserBannerPresenter(this.serviceUser) : null

  readonly headerPresenter = new HeaderPresenter(this.loggedInUser)
}

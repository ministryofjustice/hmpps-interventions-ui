import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import HeaderPresenter from './headerPresenter'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'
import { User } from '../../authentication/passport'

export default class LayoutPresenter {
  constructor(private readonly loggedInUser: User | null, readonly serviceUser: DeliusServiceUser | null) {}

  readonly serviceUserBannerPresenter = this.serviceUser ? new ServiceUserBannerPresenter(this.serviceUser) : null

  readonly headerPresenter = new HeaderPresenter(this.loggedInUser)
}

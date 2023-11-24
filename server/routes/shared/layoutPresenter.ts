import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import HeaderPresenter from './headerPresenter'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'
import LoggedInUser from '../../models/loggedInUser'
import WhatsNewBanner from '../../models/whatsNewBanner'

export default class LayoutPresenter {
  constructor(
    private readonly originalUrl: string,
    private readonly loggedInUser: LoggedInUser | null,
    readonly serviceUser: DeliusServiceUser | null,
    readonly whatsNewBanner: WhatsNewBanner | undefined,
    readonly showWhatsNewBanner: boolean
  ) {}

  readonly serviceUserBannerPresenter = this.serviceUser ? new ServiceUserBannerPresenter(this.serviceUser) : null

  readonly headerPresenter = new HeaderPresenter(this.loggedInUser)

  get dismissWhatsNewBannerHref(): string {
    return `${this.originalUrl}?dismissWhatsNewBanner=true`
  }
}

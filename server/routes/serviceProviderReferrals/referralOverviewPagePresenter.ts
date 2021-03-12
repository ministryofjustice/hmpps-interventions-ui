import { DeliusServiceUser } from '../../services/communityApiService'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'
import { SentReferral } from '../../services/interventionsService'

export enum ReferralPageSection {
  Progress = 1,
  CaseNotes,
  Details,
}

export default class ReferralOverviewPagePresenter {
  private serviceUserBannerPresenter: ServiceUserBannerPresenter

  constructor(
    private readonly section: ReferralPageSection,
    private readonly referral: SentReferral,
    serviceUser: DeliusServiceUser
  ) {
    this.serviceUserBannerPresenter = new ServiceUserBannerPresenter(serviceUser)
  }

  get serviceUserBannerArgs(): Record<string, string> {
    return this.serviceUserBannerPresenter.serviceUserBannerArgs
  }

  readonly subNavArgs = {
    items: [
      {
        text: 'Progress',
        href: `/service-provider/referrals/${this.referral.id}/progress`,
        active: this.section === ReferralPageSection.Progress,
      },
      {
        text: 'Case Notes',
        href: `/service-provider/referrals/${this.referral.id}/case-notes`,
        active: this.section === ReferralPageSection.CaseNotes,
      },
      {
        text: 'Referral Details',
        href: `/service-provider/referrals/${this.referral.id}/details`,
        active: this.section === ReferralPageSection.Details,
      },
    ],
  }
}

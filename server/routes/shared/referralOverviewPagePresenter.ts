import { DeliusServiceUser } from '../../services/communityApiService'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'

export enum ReferralOverviewPageSection {
  Progress = 1,
  CaseNotes,
  Details,
}

export default class ReferralOverviewPagePresenter {
  constructor(
    private readonly section: ReferralOverviewPageSection,
    private readonly referralId: string,
    private readonly serviceUser: DeliusServiceUser,
    private readonly subNavUrlPrefix: 'service-provider' | 'probation-practitioner'
  ) {
    this.serviceUserBannerPresenter = new ServiceUserBannerPresenter(serviceUser)
  }

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly subNavArgs = {
    items: [
      {
        text: 'Progress',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/progress`,
        active: this.section === ReferralOverviewPageSection.Progress,
      },
      {
        text: 'Case notes',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/case-notes`,
        active: this.section === ReferralOverviewPageSection.CaseNotes,
      },
      {
        text: 'Referral details',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/details`,
        active: this.section === ReferralOverviewPageSection.Details,
      },
    ],
  }
}

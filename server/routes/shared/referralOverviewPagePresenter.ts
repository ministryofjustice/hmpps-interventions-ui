import { DeliusServiceUser } from '../../services/communityApiService'
import ServiceUserBannerPresenter from './serviceUserBannerPresenter'
import { SentReferral } from '../../services/interventionsService'

export enum ReferralOverviewPageSection {
  Progress = 1,
  CaseNotes,
  Details,
}

export default class ReferralOverviewPagePresenter {
  private serviceUserBannerPresenter: ServiceUserBannerPresenter

  constructor(
    private readonly section: ReferralOverviewPageSection,
    private readonly referral: SentReferral,
    serviceUser: DeliusServiceUser,
    private readonly subNavUrlPrefix: 'service-provider' | 'probation-practitioner'
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
        href: `/${this.subNavUrlPrefix}/referrals/${this.referral.id}/progress`,
        active: this.section === ReferralOverviewPageSection.Progress,
      },
      {
        text: 'Case notes',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referral.id}/case-notes`,
        active: this.section === ReferralOverviewPageSection.CaseNotes,
      },
      {
        text: 'Referral details',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referral.id}/details`,
        active: this.section === ReferralOverviewPageSection.Details,
      },
    ],
  }
}

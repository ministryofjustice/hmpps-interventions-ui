export enum ReferralOverviewPageSection {
  Progress = 1,
  CaseNotes,
  Details,
}

export default class ReferralOverviewPagePresenter {
  constructor(
    private readonly section: ReferralOverviewPageSection,
    private readonly referralId: string,
    private readonly subNavUrlPrefix: 'service-provider' | 'probation-practitioner'
  ) {}

  readonly subNavArgs = {
    items: [
      {
        text: 'Progress',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/progress`,
        active: this.section === ReferralOverviewPageSection.Progress,
      },
      {
        text: 'Referral details',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/details`,
        active: this.section === ReferralOverviewPageSection.Details,
      },
      {
        text: 'Case notes',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/case-notes`,
        active: this.section === ReferralOverviewPageSection.CaseNotes,
      },
    ],
  }

  readonly dashboardURL = `/${this.subNavUrlPrefix}/dashboard`
}

export enum ReferralOverviewPageSection {
  Progress = 1,
  CaseNotes,
  Details,
  Changelog,
}

export default class ReferralOverviewPagePresenter {
  constructor(
    private readonly section: ReferralOverviewPageSection,
    private readonly referralId: string,
    private readonly subNavUrlPrefix: 'service-provider' | 'probation-practitioner',
    private readonly dashboardOriginPage?: string
  ) {}

  readonly subNavArgs = {
    items: [
      {
        text: 'Progress',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/progress`,
        active: this.section === ReferralOverviewPageSection.Progress,
      },
      {
        text: this.subNavUrlPrefix === 'service-provider' ? 'Referral details' : 'View or change referral',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/details`,
        active: this.section === ReferralOverviewPageSection.Details,
      },
      {
        text: 'Case notes',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/case-notes`,
        active: this.section === ReferralOverviewPageSection.CaseNotes,
      },
      {
        text: 'Change log',
        href: `/${this.subNavUrlPrefix}/referrals/${this.referralId}/changelog`,
        active: this.section === ReferralOverviewPageSection.Changelog,
      },
    ],
  }

  readonly dashboardURL = this.dashboardOriginPage
    ? `${this.dashboardOriginPage}`
    : `/${this.subNavUrlPrefix}/dashboard`
}

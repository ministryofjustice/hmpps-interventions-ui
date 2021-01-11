import DraftReferralsListPresenter from './draftReferralsListPresenter'

export default class ReferralStartView {
  constructor(private readonly presenter: DraftReferralsListPresenter) {}

  private get tableArgs(): Record<string, unknown> {
    return {
      firstCellIsHeader: true,
      head: [{ text: 'ID' }, { text: 'Started on' }, { text: 'Link' }],
      rows: this.presenter.orderedReferrals.map(referral => {
        return [{ text: referral.id }, { text: referral.createdAt }, { html: `<a href="${referral.url}">Continue</a>` }]
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/start',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
      },
    ]
  }
}

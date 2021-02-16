import DashboardPresenter from './dashboardPresenter'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  private get tableArgs(): Record<string, unknown> {
    return {
      firstCellIsHeader: true,
      head: [{ text: 'Service User' }, { text: 'Started on' }],
      rows: this.presenter.orderedReferrals.map(referral => {
        return [{ html: `<a href="${referral.url}">${referral.serviceUserFullName}</a>` }, { text: referral.createdAt }]
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/dashboard',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
      },
    ]
  }
}

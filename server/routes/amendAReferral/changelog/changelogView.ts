import ChangelogPresenter from './changelogPresenter'

export default class ChangelogView {
  constructor(readonly presenter: ChangelogPresenter) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.referralOverviewPagePresenter.dashboardURL,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/changelog',
      {
        backLinkArgs: this.backLinkArgs,
        presenter: this.presenter,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
      },
    ]
  }
}

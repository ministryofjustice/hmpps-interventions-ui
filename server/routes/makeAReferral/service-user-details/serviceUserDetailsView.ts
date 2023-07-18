import ViewUtils from '../../../utils/viewUtils'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'

export default class ServiceUserDetailsView {
  constructor(private readonly presenter: ServiceUserDetailsPresenter) {}

  private get contactDetailsSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.contactDetailsSummary,
      this.presenter.contactDetailsHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private get personalDetailsSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.personalDetailsSummary,
      this.presenter.personDetailsHeading,
      { showBorders: true, showTitle: true }
    )
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/serviceUserDetails',
      {
        presenter: this.presenter,
        contactDetailsSummaryListArgs: this.contactDetailsSummaryListArgs,
        personalDetailsSummaryListArgs: this.personalDetailsSummaryListArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}

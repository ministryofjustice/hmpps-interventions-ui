import { TableArgs } from '../../utils/govukFrontendTypes'
import ViewUtils, { serviceOutageBannerArgs } from '../../utils/viewUtils'
import DashboardPresenter from './dashboardPresenter'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  private get tableArgs(): TableArgs {
    const { tableHeadings, tableRows } = this.presenter
    return ViewUtils.sortableTable(this.presenter.tablePersistentId, tableHeadings, tableRows)
  }

  private get tableArgsForDraftCases(): TableArgs {
    const { tableHeadings, tableRowsForDrafts } = this.presenter
    return ViewUtils.sortableTable(this.presenter.tablePersistentId, tableHeadings, tableRowsForDrafts)
  }

  readonly subNavArgs = {
    items: [
      {
        text: 'Open cases',
        href: `/probation-practitioner/dashboard/open-cases`,
        active: this.presenter.dashboardType === 'Open cases',
      },
      {
        text: 'Unassigned cases',
        href: `/probation-practitioner/dashboard/unassigned-cases`,
        active: this.presenter.dashboardType === 'Unassigned cases',
      },
      {
        text: 'Completed cases',
        href: `/probation-practitioner/dashboard/completed-cases`,
        active: this.presenter.dashboardType === 'Completed cases',
      },
      {
        text: 'Cancelled cases',
        href: `/probation-practitioner/dashboard/cancelled-cases`,
        active: this.presenter.dashboardType === 'Cancelled cases',
      },
      {
        text: 'Draft cases',
        href: `/probation-practitioner/dashboard/draft-cases`,
        active: this.presenter.dashboardType === 'Draft cases',
      },
    ],
  }
  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/dashboard',
      {
        presenter: this.presenter,
        tableArgs: this.presenter.dashboardType !== 'Draft cases' ? this.tableArgs : this.tableArgsForDraftCases,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.navItemsPresenter.items),
        subNavArgs: this.subNavArgs,
        pagination: this.presenter.pagination.mojPaginationArgs,
        showSearchResult: {},
        serviceOutageBannerArgs: serviceOutageBannerArgs(this.presenter.closeHref),
        enableDowntimeBanner: !this.presenter.disableDowntimeBanner,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}

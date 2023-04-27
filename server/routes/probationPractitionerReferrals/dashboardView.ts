import { NotificationBannerArgs, TableArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import DashboardPresenter from './dashboardPresenter'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  private get tableArgs(): TableArgs {
    const { tableHeadings, tableRows } = this.presenter
    return ViewUtils.sortableTable(this.presenter.tablePersistentId, tableHeadings, tableRows)
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
    ],
  }

  get serviceOutageBannerArgs(): NotificationBannerArgs | null {
    const text =
      'Refer and monitor an intervention will not be available on Saturday 29 April 2023 between 5pm and 8pm.'

    const html = `<p class="govuk-notification-banner__heading">${text}</p>
                  <p><a class="govuk-notification-banner__link" href= ${this.presenter.closeHref}>Close</a></p>`
    return {
      titleText: 'Planned downtime',
      html,
      classes: 'govuk-notification-banner--info',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/dashboard',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.navItemsPresenter.items),
        subNavArgs: this.subNavArgs,
        pagination: this.presenter.pagination.mojPaginationArgs,
        showSearchResult: {},
        serviceOutageBannerArgs: this.serviceOutageBannerArgs,
      },
    ]
  }
}

import DashboardPresenter from './dashboardPresenter'
import ViewUtils from '../../utils/viewUtils'
import { TableArgs } from '../../utils/govukFrontendTypes'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  private get tableArgs(): TableArgs {
    const { tableHeadings, tableRows, secondOrderColumnNumber } = this.presenter
    return ViewUtils.sortableTable(
      `serviceProvider${this.presenter.dashboardTypePersistentId}`,
      tableHeadings,
      tableRows,
      { secondOrderColumnNumber }
    )
  }

  readonly subNavArgs = {
    items: [
      {
        text: 'My cases',
        href: `/service-provider/dashboard/my-cases`,
        active: this.presenter.dashboardType === 'My cases',
      },
      {
        text: 'All open cases',
        href: `/service-provider/dashboard/all-open-cases`,
        active: this.presenter.dashboardType === 'All open cases',
      },
      {
        text: 'Unassigned cases',
        href: `/service-provider/dashboard/unassigned-cases`,
        active: this.presenter.dashboardType === 'Unassigned cases',
      },
      {
        text: 'Completed cases',
        href: `/service-provider/dashboard/completed-cases`,
        active: this.presenter.dashboardType === 'Completed cases',
      },
    ],
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/dashboard',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.navItemsPresenter.items),
        subNavArgs: this.subNavArgs,
      },
    ]
  }
}

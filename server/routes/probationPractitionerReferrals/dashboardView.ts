import { TableArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import DashboardPresenter from './dashboardPresenter'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  private get tableArgs(): TableArgs {
    const { tableHeadings, tableRows, secondOrderColumnNumber } = this.presenter
    return ViewUtils.sortableTable(
      `probationPractitioner${this.presenter.dashboardTypePersistentId}`,
      tableHeadings,
      tableRows,
      {
        secondOrderColumnNumber,
      }
    )
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

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/dashboard',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.navItemsPresenter.items),
        subNavArgs: this.subNavArgs,
      },
    ]
  }
}

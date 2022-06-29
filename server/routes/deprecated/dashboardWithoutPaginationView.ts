import ViewUtils from '../../utils/viewUtils'
import { TableArgs, InputArgs } from '../../utils/govukFrontendTypes'
import DashboardWithoutPaginationPresenter from './dashboardWithoutPaginationPresenter'

export default class DashboardWithoutPaginationView {
  constructor(private readonly presenter: DashboardWithoutPaginationPresenter) {}

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

  private get subjectInputArgs(): InputArgs {
    return {
      label: {
        text: 'Search by a person on probation in open cases',
        classes: 'govuk-label--l',
      },

      autocomplete: 'off',
      id: 'open-case-search-text',
      name: 'open-case-search-text',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/dashboardWithoutPagination',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.navItemsPresenter.items),
        subNavArgs: this.subNavArgs,
        subjectInputArgs: this.subjectInputArgs,
        showSearchResult: {},
      },
    ]
  }
}

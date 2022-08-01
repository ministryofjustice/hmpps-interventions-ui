import DashboardPresenter from './dashboardPresenter'
import ViewUtils from '../../utils/viewUtils'
import { TableArgs, InputArgs } from '../../utils/govukFrontendTypes'

export default class DashboardView {
  constructor(private readonly presenter: DashboardPresenter) {}

  private get tableArgs(): TableArgs {
    const { tableHeadings, tableRows } = this.presenter
    return ViewUtils.sortableTable(this.presenter.tablePersistentId, tableHeadings, tableRows)
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
      classes: 'moj-search__input govuk-!-width-two-thirds govuk-!-margin-left-9',
      label: {
        classes: 'govuk-label--m govuk-!-margin-left-9 govuk-!-margin-top-8',
        text: 'Search by a person on probation in open cases',
      },
      autocomplete: 'off',
      hint: {
        classes: 'moj-search__hint govuk-!-margin-left-9',
        text: 'You need to enter their first and last name, for example Matt Jones.',
      },
      id: 'open-case-search-text',
      name: 'open-case-search-text',
      value: this.presenter.searchText ?? undefined,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/dashboard',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.navItemsPresenter.items),
        subNavArgs: this.subNavArgs,
        subjectInputArgs: this.subjectInputArgs,
        pagination: this.presenter.pagination.mojPaginationArgs,
        clearHref: this.presenter.hrefSearchText,
      },
    ]
  }
}

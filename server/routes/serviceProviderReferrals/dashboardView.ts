import DashboardPresenter from './dashboardPresenter'
import ViewUtils from '../../utils/viewUtils'
import { TableArgs, InputArgs, NotificationBannerArgs } from '../../utils/govukFrontendTypes'

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
      {
        text: 'Cancelled cases',
        href: `/service-provider/dashboard/cancelled-cases`,
        active: this.presenter.dashboardType === 'Cancelled cases',
      },
    ],
    attributes: { 'data-cy': 'dashboard-navigation' },
  }

  private get subjectInputArgs(): InputArgs {
    return {
      classes: 'moj-search__input govuk-!-width-two-thirds govuk-!-margin-left-9',
      label: {
        classes: 'govuk-label--m govuk-!-margin-left-9 govuk-!-margin-top-8',
        text: `Search ${this.presenter.casesType} by referral number or person on probation`,
      },
      autocomplete: 'off',
      hint: {
        classes: 'moj-search__hint govuk-!-margin-left-9',
        text: 'To search by person on probation enter their first and last name, for example Matthew Smith-Jones.',
      },
      id: 'case-search-text',
      name: 'case-search-text',
      value: this.presenter.searchText ?? undefined,
    }
  }

  get serviceOutageBannerArgs(): NotificationBannerArgs {
    const text =
      'Updates are being made to Refer and monitor on Friday 30 August from 5pm. This means that over the weekend the service will run slower than usual and may time out. Normal service will resume on Monday 2 September. This work will deliver changes to the dashboard and an auto-approve action plan feature.'

    const html = `<div class="refer-and-monitor__max-width"><p class="govuk-notification-banner__heading">${text}</p>
                  <p><a class="govuk-notification-banner__link" href= ${this.presenter.closeHref}>Close</a></p></div>`
    return {
      titleText: 'Planned changes',
      html,
      classes: 'govuk-notification-banner--info',
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
        clearHref: this.presenter.hrefLinkForClear,
        serviceOutageBannerArgs: this.serviceOutageBannerArgs,
      },
    ]
  }
}

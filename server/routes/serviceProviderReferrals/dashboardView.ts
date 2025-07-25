import { InputArgs, NotificationBannerArgs, TableArgs } from '../../utils/govukFrontendTypes'
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
      'Refer and monitor an intervention will be unavailable between 4pm on Friday 25 July and 8am on Monday 28 July. This is due to planned maintenance in NDelius.'
    const subHeading = 'Planned Downtime'

    const html = `<div class="refer-and-monitor__max-width">
                  <p class="govuk-notification-banner__heading"> ${subHeading}</p>
                  <p class="govuk-body">${text}</p>
                  <p><a class="govuk-notification-banner__link" href= ${this.presenter.closeHref}>Close</a></p></div>`
    return {
      titleText: 'Downtime',
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

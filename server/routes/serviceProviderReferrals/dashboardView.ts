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
      'Refer and monitor an intervention will not be available this weekend. This is from 10am Saturday 28 October to midday Sunday 29 October 2023.'

    const html = `<p class="govuk-notification-banner__heading">${text}</p>
                  <p><a class="govuk-notification-banner__link" href= ${this.presenter.closeHref}>Close</a></p>`
    return {
      titleText: 'Planned downtime',
      html,
      classes: 'govuk-notification-banner--info',
    }
  }

  get whatsNewBannerArgs(): NotificationBannerArgs {
    const html = `<p class="govuk-notification-banner__heading">${this.presenter.whatsNewBanner?.heading}</p>
                  <p class="govuk-body">${this.presenter.whatsNewBanner?.text}<br/>
                    <a class="govuk-notification-banner__link" href='/service-provider/whats-new'>${this.presenter.whatsNewBanner?.linkText}</a>
                  </p>
                  <p><a class="govuk-notification-banner__link" href=${this.presenter.closeWhatsNewBannerHref}>Close</a></p>`
    return {
      titleText: 'What’s new',
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
        whatsNewBannerArgs: this.whatsNewBannerArgs,
      },
    ]
  }
}

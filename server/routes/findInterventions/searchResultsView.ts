import SearchResultsPresenter from './searchResultsPresenter'
import ViewUtils from '../../utils/viewUtils'
import { SummaryListItem } from '../../utils/summaryList'
import { CheckboxesArgs, NotificationBannerArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'

export default class SearchResultsView {
  constructor(private readonly presenter: SearchResultsPresenter) {}

  private checkboxArgs({
    name,
    legend,
    checkboxes,
  }: {
    name: string
    legend: string
    checkboxes: {
      value: string
      text: string
      checked: boolean
    }[]
  }): CheckboxesArgs {
    return {
      idPrefix: name,
      name: `${name}[]`,
      fieldset: {
        legend: {
          text: legend,
          classes: 'govuk-fieldset__legend--s',
        },
        classes: 'find-filters--scrollable',
      },
      items: checkboxes.map(checkbox => ({
        value: checkbox.value,
        text: checkbox.text,
        checked: checkbox.checked,
      })),
    }
  }

  private get pccRegionCheckboxArgs(): CheckboxesArgs {
    return this.checkboxArgs({ name: 'pcc-region-ids', legend: 'Regions', checkboxes: this.presenter.pccRegionFilters })
  }

  private get genderCheckboxArgs(): CheckboxesArgs {
    return this.checkboxArgs({ name: 'gender', legend: 'Gender', checkboxes: this.presenter.genderFilters })
  }

  private get ageCheckboxArgs(): CheckboxesArgs {
    return this.checkboxArgs({ name: 'age', legend: 'Age restrictions', checkboxes: this.presenter.ageFilters })
  }

  static summaryListArgs(items: SummaryListItem[]): SummaryListArgs {
    return {
      ...ViewUtils.summaryListArgs(items),
      classes: 'govuk-summary-list--no-border refer-and-monitor__intervention-summary-list',
    }
  }

  private searchSummarySummaryListArgs = ViewUtils.summaryListArgs(this.presenter.summary.summary)

  get serviceOutageBannerArgs(): NotificationBannerArgs {
    const text =
      'Refer and monitor an intervention will be unavailable between 9pm on Friday 19 September and 7am on Monday 22 September. This is due to planned maintenance in NDelius.'
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
      'findInterventions/searchResults',
      {
        presenter: this.presenter,
        pccRegionCheckboxArgs: this.pccRegionCheckboxArgs,
        genderCheckboxArgs: this.genderCheckboxArgs,
        ageCheckboxArgs: this.ageCheckboxArgs,
        summaryListArgs: SearchResultsView.summaryListArgs,
        searchSummarySummaryListArgs: this.searchSummarySummaryListArgs,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.navItemsPresenter.items),
        serviceOutageBannerArgs: this.serviceOutageBannerArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}

import SearchResultsPresenter from './searchResultsPresenter'
import ViewUtils from '../../utils/viewUtils'
import { SummaryListItem } from '../../utils/summaryList'
import { CheckboxesArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'

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
      },
    ]
  }
}

import SearchResultsPresenter from './searchResultsPresenter'
import ViewUtils from '../../utils/viewUtils'
import { SummaryListItem } from '../../utils/summaryList'
import { SummaryListArgs } from '../../utils/govukFrontendTypes'

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
  }): Record<string, unknown> {
    return {
      idPrefix: name,
      name: `${name}[]`,
      fieldset: {
        legend: {
          text: legend,
          classes: 'govuk-fieldset__legend--s',
        },
      },
      items: checkboxes.map(checkbox => ({
        value: checkbox.value,
        text: checkbox.text,
        checked: checkbox.checked,
      })),
    }
  }

  private get pccRegionCheckboxArgs(): Record<string, unknown> {
    return this.checkboxArgs({ name: 'pcc-region-ids', legend: 'Regions', checkboxes: this.presenter.pccRegionFilters })
  }

  private get genderCheckboxArgs(): Record<string, unknown> {
    return this.checkboxArgs({ name: 'gender', legend: 'Gender', checkboxes: this.presenter.genderFilters })
  }

  private get ageCheckboxArgs(): Record<string, unknown> {
    return this.checkboxArgs({ name: 'age', legend: 'Age restrictions', checkboxes: this.presenter.ageFilters })
  }

  static summaryListArgs(items: SummaryListItem[]): SummaryListArgs & { classes: string } {
    return { ...ViewUtils.summaryListArgs(items), classes: 'govuk-summary-list--no-border' }
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
      },
    ]
  }
}

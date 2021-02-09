import SearchResultsPresenter from './searchResultsPresenter'
import ViewUtils from '../../utils/viewUtils'
import { SummaryListArgs, SummaryListItem } from '../../utils/summaryList'

export default class SearchResultsView {
  constructor(private readonly presenter: SearchResultsPresenter) {}

  static summaryListArgs(items: SummaryListItem[]): SummaryListArgs & { classes: string } {
    return { ...ViewUtils.summaryListArgs(items), classes: 'govuk-summary-list--no-border' }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'findInterventions/searchResults',
      { presenter: this.presenter, summaryListArgs: SearchResultsView.summaryListArgs },
    ]
  }
}

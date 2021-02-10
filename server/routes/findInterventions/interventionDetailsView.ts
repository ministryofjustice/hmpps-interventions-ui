import ViewUtils from '../../utils/viewUtils'
import { SummaryListArgs, SummaryListItem } from '../../utils/summaryList'
import InterventionDetailsPresenter from './interventionDetailsPresenter'

export default class InterventionDetailsView {
  constructor(private readonly presenter: InterventionDetailsPresenter) {}

  static summaryListArgs(items: SummaryListItem[]): SummaryListArgs & { classes: string } {
    return { ...ViewUtils.summaryListArgs(items), classes: 'govuk-summary-list--no-border' }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'findInterventions/interventionDetails',
      { presenter: this.presenter, summaryListArgs: InterventionDetailsView.summaryListArgs },
    ]
  }
}

import ViewUtils from '../../utils/viewUtils'
import { SummaryListItem } from '../../utils/summaryList'
import { SummaryListArgs } from '../../utils/govukFrontendTypes'
import InterventionDetailsPresenter from './interventionDetailsPresenter'

export default class InterventionDetailsView {
  constructor(private readonly presenter: InterventionDetailsPresenter) {}

  static summaryListArgs(items: SummaryListItem[]): SummaryListArgs {
    return {
      ...ViewUtils.summaryListArgs(items),
      classes: 'govuk-summary-list--no-border refer-and-monitor__intervention-summary-list',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'findInterventions/interventionDetails',
      {
        presenter: this.presenter,
        summaryListArgs: InterventionDetailsView.summaryListArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}

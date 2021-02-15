import ViewUtils from '../../utils/viewUtils'
import { SummaryListArgs, SummaryListItem } from '../../utils/summaryList'
import InterventionDetailsPresenter from './interventionDetailsPresenter'
import { TabsArgs } from '../../utils/govukFrontendTypes'

export default class InterventionDetailsView {
  constructor(private readonly presenter: InterventionDetailsPresenter) {}

  static summaryListArgs(items: SummaryListItem[]): SummaryListArgs & { classes: string } {
    return { ...ViewUtils.summaryListArgs(items), classes: 'govuk-summary-list--no-border' }
  }

  private tabsArgs(summaryListMacro: (args: unknown) => string): TabsArgs {
    return {
      items: this.presenter.tabs.map(tab => {
        return {
          label: tab.title,
          id: tab.id,
          panel: {
            html: summaryListMacro(InterventionDetailsView.summaryListArgs(tab.items)),
          },
        }
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'findInterventions/interventionDetails',
      {
        presenter: this.presenter,
        summaryListArgs: InterventionDetailsView.summaryListArgs,
        tabsArgs: this.tabsArgs.bind(this),
      },
    ]
  }
}

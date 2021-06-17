import ActionPlanDetailsPresenter from './actionPlanDetailsPresenter'
import ActionPlanSummaryView from './actionPlanSummaryView'

export default class ActionPlanDetailsView {
  actionPlanSummaryView: ActionPlanSummaryView

  constructor(private readonly presenter: ActionPlanDetailsPresenter, private readonly includeTodo: boolean) {
    this.actionPlanSummaryView = new ActionPlanSummaryView(presenter, false)
  }

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.interventionProgressURL,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/actionPlan',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        actionPlanSummaryListArgs: this.actionPlanSummaryView.actionPlanSummaryListArgs.bind(this),
      },
    ]
  }
}

import { SummaryListArgs, SummaryListArgsRow, TagArgs } from '../../../utils/govukFrontendTypes'
import ActionPlanSummaryPresenter from './actionPlanSummaryPresenter'
import ActionPlanUtils from '../../../utils/actionPlanUtils'

export default class ActionPlanSummaryView {
  constructor(private readonly presenter: ActionPlanSummaryPresenter) {}

  summaryListArgs(tagMacro: (args: TagArgs) => string): SummaryListArgs {
    const rows: SummaryListArgsRow[] = [
      {
        key: { text: 'Action plan status' },
        value: {
          text: tagMacro(ActionPlanUtils.actionPlanTagArgs(this.presenter.actionPlanStatus)),
        },
      },
    ]

    if (this.presenter.actionPlanSubmitted) {
      rows.push({
        key: { text: 'Submitted date' },
        value: {
          text: this.presenter.text.actionPlanSubmittedDate,
          classes: 'action-plan-submitted-date',
        },
      })
    }

    if (this.presenter.actionPlanApproved) {
      rows.push({
        key: { text: 'Approval date' },
        value: { text: this.presenter.text.actionPlanApprovalDate },
      })
    }

    return { rows }
  }
}

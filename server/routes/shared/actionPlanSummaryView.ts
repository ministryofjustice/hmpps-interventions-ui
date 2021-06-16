import ActionPlanDetailsPresenter from './actionPlanDetailsPresenter'
import { SummaryListArgs, SummaryListArgsRow, TagArgs } from '../../utils/govukFrontendTypes'

export default class ActionPlanSummaryView {
  constructor(private readonly presenter: ActionPlanDetailsPresenter) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.interventionProgressURL,
  }

  get actionPlanTagClass(): string {
    switch (this.presenter.text.actionPlanStatus) {
      case 'Approved':
        return 'govuk-tag--green'
      case 'Under review':
        return 'govuk-tag--red'
      default:
        return 'govuk-tag--grey'
    }
  }

  private actionPlanSummaryListArgs(tagMacro: (args: TagArgs) => string): SummaryListArgs {
    const rows: SummaryListArgsRow[] = [
      {
        key: { text: 'Action plan status' },
        value: {
          text: tagMacro({
            text: this.presenter.text.actionPlanStatus,
            classes: this.actionPlanTagClass,
            attributes: { id: 'action-plan-status' },
          }),
        },
      },
      {
        key: { text: 'Submitted date' },
        value: {
          text: this.presenter.text.actionPlanSubmittedDate,
          classes: 'action-plan-submitted-date',
        },
      },
    ]

    return { rows }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/actionPlan',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        actionPlanSummaryListArgs: this.actionPlanSummaryListArgs.bind(this),
      },
    ]
  }
}

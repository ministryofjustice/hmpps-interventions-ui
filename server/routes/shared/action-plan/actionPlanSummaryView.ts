import { SummaryListArgs, SummaryListArgsRow, TagArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import ActionPlanSummaryPresenter from './actionPlanSummaryPresenter'

export default class ActionPlanSummaryView {
  constructor(private readonly presenter: ActionPlanSummaryPresenter, private readonly includeTodo: boolean) {}

  private get actionPlanTagClass(): string {
    switch (this.presenter.text.actionPlanStatus) {
      case 'Approved':
        return 'govuk-tag--green'
      case 'Awaiting approval':
        return 'govuk-tag- govuk-tag--red'
      default:
        return 'govuk-tag--grey'
    }
  }

  summaryListArgs(tagMacro: (args: TagArgs) => string, csrfToken?: string): SummaryListArgs {
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

    if (this.includeTodo) {
      if (this.presenter.actionPlanSubmitted) {
        rows.push({
          key: { text: 'Action' },
          value: {
            html: `<a href="${this.presenter.viewActionPlanUrl}" class="govuk-link">View action plan</a>`,
          },
        })
      } else if (this.presenter.userType === 'service-provider') {
        if (!this.presenter.actionPlanCreated) {
          rows.push({
            key: { text: 'Action' },
            value: {
              html: `<form method="post" action="${ViewUtils.escape(this.presenter.createActionPlanFormAction)}">
                     <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken!)}">
                     <button data-module="govuk-button" data-prevent-double-click="true">
                       Create action plan
                     </button>
                     </form>`,
            },
          })
        } else if (!this.presenter.actionPlanSubmitted) {
          rows.push({
            key: { text: 'Action' },
            value: {
              html: `<a href="${this.presenter.actionPlanFormUrl}" class="govuk-link">Submit action plan</a>`,
            },
          })
        }
      }
    }

    return { rows }
  }
}

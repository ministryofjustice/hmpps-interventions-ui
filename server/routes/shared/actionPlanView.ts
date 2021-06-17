import ActionPlanPresenter from './actionPlanPresenter'
import { InsetTextArgs, SummaryListArgs, SummaryListArgsRow, TagArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'

export default class ActionPlanView {
  constructor(private readonly presenter: ActionPlanPresenter, private readonly includeSummaryTodo: boolean) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.interventionProgressURL,
  }

  insetTextActivityArgs(index: number, description: string): InsetTextArgs {
    return {
      html: `<h3 class="govuk-heading-m govuk-!-font-weight-bold">Activity ${index}</h3><p class="govuk-body">${description}</p>`,
      classes: 'app-inset-text--grey',
    }
  }

  private get actionPlanTagClass(): string {
    switch (this.presenter.text.actionPlanStatus) {
      case 'Approved':
        return 'govuk-tag--green'
      case 'Under review':
        return 'govuk-tag- govuk-tag--red'
      default:
        return 'govuk-tag--grey'
    }
  }

  actionPlanSummaryListArgs(tagMacro: (args: TagArgs) => string, csrfToken?: string): SummaryListArgs {
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

    if (this.includeSummaryTodo) {
      if (!this.presenter.actionPlanCreated) {
        rows.push({
          key: { text: 'Action' },
          value: {
            html: `<form method="post" action="${ViewUtils.escape(this.presenter.createActionPlanFormAction)}">
                     <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken!)}">
                     <button class="govuk-button govuk-button--secondary">Create action plan</button>
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
      } else {
        rows.push({
          key: { text: 'Action' },
          value: {
            html: `<a href="${this.presenter.viewActionPlanUrl}" class="govuk-link">View action plan</a>`,
          },
        })
      }
    }

    return { rows }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/actionPlan',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        actionPlanSummaryListArgs: this.actionPlanSummaryListArgs.bind(this),
        insetTextActivityArgs: this.insetTextActivityArgs.bind(this),
      },
    ]
  }
}

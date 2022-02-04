import { TableArgs, TableArgsCell, TagArgs } from '../../../utils/govukFrontendTypes'
import ActionPlanProgressPresenter from './actionPlanProgressPresenter'
import ActionPlanUtils, { ActionPlanStatus } from '../../../utils/actionPlanUtils'
import DateUtils from '../../../utils/dateUtils'
import ViewUtils from '../../../utils/viewUtils'

export default class ActionPlanProgressView {
  constructor(private readonly presenter: ActionPlanProgressPresenter) {}

  tableArgs(tagMacro: (args: TagArgs) => string, csrfToken?: string): TableArgs {
    const rows: TableArgsCell[][] = []

    if (this.presenter.includeCurrentActionPlanRow) {
      rows.push(this.getCurrentActionPlanRow(tagMacro, csrfToken))
    }

    rows.push(
      ...this.presenter.approvedActionPlanSummaries.map((summary, i) => [
        {
          text: (this.presenter.approvedActionPlanSummaries.length - i).toString(),
          classes: 'action-plan-version',
        },
        {
          text: tagMacro(ActionPlanUtils.actionPlanTagArgs(ActionPlanStatus.Approved)),
          classes: 'action-plan-status',
        },
        {
          text: DateUtils.formattedDate(summary.submittedAt),
          classes: 'action-plan-submitted-date',
        },
        {
          text: DateUtils.formattedDate(summary.approvedAt),
          classes: 'action-plan-approved-date',
        },
        {
          html: `<a href="/${this.presenter.userType}/action-plan/${summary.id}" class="govuk-link">View action plan</a>`,
        },
      ])
    )

    return {
      head: this.presenter.tableHeaders.map(header => {
        return { text: header }
      }),
      rows,
    }
  }

  private getCurrentActionPlanRow(tagMacro: (args: TagArgs) => string, csrfToken?: string): TableArgsCell[] {
    const currentActionPlanSummary = this.presenter.currentActionPlanSummaryPresenter
    const row: TableArgsCell[] = [
      {
        text: '',
        classes: 'action-plan-version',
      },
      {
        text: tagMacro(ActionPlanUtils.actionPlanTagArgs(currentActionPlanSummary.actionPlanStatus)),
        classes: 'action-plan-status',
      },
      {
        text: currentActionPlanSummary.text.actionPlanSubmittedDate,
        classes: 'action-plan-submitted-date',
      },
      {
        text: currentActionPlanSummary.text.actionPlanApprovalDate,
        classes: 'action-plan-approved-date',
      },
    ]

    if (currentActionPlanSummary.actionPlanSubmitted) {
      row.push({ html: `<a href="${this.presenter.viewCurrentActionPlanUrl}" class="govuk-link">View action plan</a>` })
    } else if (currentActionPlanSummary.actionPlanCreated) {
      row.push({
        html: `<a href="${this.presenter.continueInProgressActionPlanUrl}" class="govuk-link">Continue action plan</a>`,
      })
    } else if (this.presenter.includeCreateActionPlanButton) {
      row.push({
        html: `<form method="post" action="${ViewUtils.escape(this.presenter.createNewActionPlanUrl)}">
               <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken!)}">
               <button class="button-link" data-module="govuk-button" data-prevent-double-click="true">Create action plan</button>
               </form>`,
      })
    } else {
      row.push({ text: '' })
    }

    return row
  }
}

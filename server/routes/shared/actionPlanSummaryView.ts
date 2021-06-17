import ActionPlanDetailsPresenter from './actionPlanDetailsPresenter'
import { SummaryListArgs, SummaryListArgsRow, TagArgs } from '../../utils/govukFrontendTypes'

export default class ActionPlanSummaryView {
  constructor(private readonly presenter: ActionPlanDetailsPresenter, private readonly includeTodo: boolean) {}

  private get actionPlanTagClass(): string {
    switch (this.presenter.text.actionPlanStatus) {
      case 'Approved':
        return 'govuk-tag--green'
      case 'Under review':
        return 'govuk-tag--red'
      default:
        return 'govuk-tag--grey'
    }
  }
  //
  // private NEWactionPlanSummaryListArgs(tagMacro: (args: TagArgs) => string, csrfToken: string): SummaryListArgs {
  //   const rows: SummaryListArgsRow[] = [
  //     {
  //       key: { text: 'Action plan status' },
  //       value: {
  //         text: tagMacro({
  //           text: this.presenter.text.actionPlanStatus,
  //           classes: this.actionPlanTagClass,
  //           attributes: { id: 'action-plan-status' },
  //         }),
  //       },
  //     },
  //   ]
  //
  //   if (!this.presenter.actionPlanDetailsPresenter.actionPlanCreated) {
  //     // action plan doesn't exist; show link to create one
  //     rows.push({
  //       key: { text: 'To do' },
  //       value: {
  //         html: `<form method="post" action="${ViewUtils.escape(
  //           this.presenter.actionPlanDetailsPresenter.createActionPlanFormAction
  //         )}">
  //                  <input type="hidden" name="_csrf" value="${ViewUtils.escape(csrfToken)}">
  //                  <button class="govuk-button govuk-button--secondary">
  //                    Create action plan
  //                  </button>
  //                </form>`,
  //       },
  //     })
  //   } else if (
  //     this.presenter.actionPlanDetailsPresenter.actionPlanCreated &&
  //     !this.presenter.actionPlanDetailsPresenter.actionPlanUnderReview
  //   ) {
  //     // action plan exists, but has not been submitted
  //     rows.push({
  //       key: { text: 'To do' },
  //       value: {
  //         html: `<a href="${this.presenter.actionPlanDetailsPresenter.actionPlanFormUrl}" class="govuk-link">Submit action plan</a>`,
  //       },
  //     })
  //   } else if (this.presenter.actionPlanDetailsPresenter.actionPlanUnderReview) {
  //     // action plan has been submitted; show link to view it
  //     rows.push({
  //       key: { text: 'Submitted date' },
  //       value: {
  //         text: this.presenter.actionPlanDetailsPresenter.text.actionPlanSubmittedDate,
  //         classes: 'action-plan-submitted-date',
  //       },
  //     })
  //     rows.push({
  //       key: { text: 'To do' },
  //       value: {
  //         html: `<a href="${this.presenter.actionPlanDetailsPresenter.viewActionPlanUrl}" class="govuk-link">View action plan</a>`,
  //       },
  //     })
  //   } else if (this.presenter.actionPlanDetailsPresenter.actionPlanApproved) {
  //     // action plan has been approved; show link to view it
  //     rows.push({
  //       key: { text: 'Submitted date' },
  //       value: {
  //         text: this.presenter.actionPlanDetailsPresenter.text.actionPlanSubmittedDate,
  //         classes: 'action-plan-submitted-date',
  //       },
  //     })
  //     rows.push({
  //       key: { text: 'Approval date' },
  //       value: { text: this.presenter.actionPlanDetailsPresenter.text.actionPlanApprovalDate },
  //     })
  //     rows.push({
  //       key: { text: 'To do' },
  //       value: {
  //         html: `<a href="${this.presenter.actionPlanDetailsPresenter.viewActionPlanUrl}" class="govuk-link">View action plan</a>`,
  //       },
  //     })
  //   }
  //
  //   return { rows }
  // }

  actionPlanSummaryListArgs(tagMacro: (args: TagArgs) => string): SummaryListArgs {
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
}

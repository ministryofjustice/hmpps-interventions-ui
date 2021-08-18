import ActionPlanPresenter from './actionPlanPresenter'
import { CheckboxesArgs, InsetTextArgs, TableArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import ActionPlanSummaryView from './actionPlanSummaryView'

export default class ActionPlanView {
  actionPlanSummaryView: ActionPlanSummaryView

  constructor(private readonly presenter: ActionPlanPresenter) {
    this.actionPlanSummaryView = new ActionPlanSummaryView(presenter.actionPlanSummaryPresenter, false)
  }

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.interventionProgressURL,
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  insetTextActivityArgs(index: number, description: string): InsetTextArgs {
    return {
      html: `<h3 class="govuk-heading-m govuk-!-font-weight-bold">Activity ${index}</h3><p class="govuk-body">${description}</p>`,
      classes: 'app-inset-text--grey',
    }
  }

  get confirmApprovalCheckboxArgs(): CheckboxesArgs {
    return {
      idPrefix: 'confirm-approval',
      name: 'confirm-approval[]',
      items: [
        {
          value: 'confirmed',
          text: 'I confirm that I want to approve the action plan',
        },
      ],
      classes: 'govuk-checkboxes__inset--grey',
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fieldErrors.confirmApproval),
    }
  }

  get approvedActionPlansTableArgs(): TableArgs | null {
    return {
      head: [{ text: 'Approval date' }],
      rows: this.presenter.actionPlanVersions.map(actionPlan => [{ text: actionPlan.approvalDate }]),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/actionPlan',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        actionPlanSummaryListArgs: this.actionPlanSummaryView.summaryListArgs.bind(this.actionPlanSummaryView),
        approvedActionPlansTableArgs: this.approvedActionPlansTableArgs,
        insetTextActivityArgs: this.insetTextActivityArgs.bind(this),
        confirmApprovalCheckboxArgs: this.confirmApprovalCheckboxArgs,
      },
    ]
  }
}

import ActionPlanPresenter from './actionPlanPresenter'
import { CheckboxesArgs, InsetTextArgs, NotificationBannerArgs, TableArgs } from '../../../utils/govukFrontendTypes'
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
      html: `<h3 class="govuk-heading-m govuk-!-font-weight-bold">Activity ${index}</h3><p class="govuk-body">${ViewUtils.nl2br(
        description
      )}</p>`,
      classes: 'app-inset-text app-inset-text--left-border',
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
      head: [{ text: 'Version number' }, { text: 'Approval date' }, { text: 'Action' }],
      rows: this.presenter.actionPlanVersions.map(actionPlan => {
        const actionRow =
          actionPlan.href === null
            ? { text: 'This version' }
            : { html: `<a href="${ViewUtils.escape(actionPlan.href)}">View</a>` }
        return [{ text: String(actionPlan.versionNumber) }, { text: actionPlan.approvalDate }, actionRow]
      }),
    }
  }

  get viewingPreviousActionPlanNotificationBannerArgs(): NotificationBannerArgs {
    return {
      html: `<p class="govuk-body-m">You are looking at an older version of the action plan.</p><a href="${this.presenter.viewProbationPractitionerLatestActionPlanURL}">Click here to see the current action plan.</a>`,
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
        viewingPreviousActionPlanNotificationBannerArgs: this.viewingPreviousActionPlanNotificationBannerArgs,
        confirmApprovalCheckboxArgs: this.confirmApprovalCheckboxArgs,
      },
    ]
  }
}

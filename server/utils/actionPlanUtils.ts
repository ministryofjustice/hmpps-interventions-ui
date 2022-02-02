import ApprovedActionPlanSummary from '../models/approvedActionPlanSummary'
import { TagArgs } from './govukFrontendTypes'

export enum ActionPlanStatus {
  Approved = 'Approved',
  AwaitingApproval = 'Awaiting approval',
  InDraft = 'In draft',
  NotSubmitted = 'Not submitted',
}

export default class ActionPlanUtils {
  static getLatestApprovedActionPlanSummary(
    actionPlanSummaries: ApprovedActionPlanSummary[]
  ): ApprovedActionPlanSummary | null {
    return (
      actionPlanSummaries.sort((a, b) => {
        return new Date(a.approvedAt) >= new Date(b.approvedAt) ? -1 : 1
      })?.[0] ?? null
    )
  }

  private static actionPlanTagClass(actionPlanStatus: ActionPlanStatus): string {
    switch (actionPlanStatus) {
      case ActionPlanStatus.Approved:
        return 'govuk-tag--green'
      case ActionPlanStatus.AwaitingApproval:
        return 'govuk-tag--red'
      case ActionPlanStatus.InDraft:
        return 'govuk-tag--yellow'
      default:
        return 'govuk-tag--grey'
    }
  }

  static actionPlanTagArgs(status: ActionPlanStatus): TagArgs {
    return {
      text: status,
      classes: ActionPlanUtils.actionPlanTagClass(status),
      attributes: { id: 'action-plan-status' },
    }
  }
}

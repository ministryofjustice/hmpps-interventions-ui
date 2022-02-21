import ApprovedActionPlanSummary from '../models/approvedActionPlanSummary'
import { TagArgs } from './govukFrontendTypes'

export enum ActionPlanStatus {
  Approved = 'Approved',
  AwaitingApproval = 'Awaiting approval',
  InDraft = 'In draft',
  NotSubmitted = 'Not submitted',
}

export default class ActionPlanUtils {
  static sortApprovedActionPlanSummaries(
    actionPlanSummaries: ApprovedActionPlanSummary[]
  ): ApprovedActionPlanSummary[] {
    return actionPlanSummaries.sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime())
  }

  static getLatestApprovedActionPlanSummary(
    actionPlanSummaries: ApprovedActionPlanSummary[]
  ): ApprovedActionPlanSummary | null {
    return ActionPlanUtils.sortApprovedActionPlanSummaries(actionPlanSummaries)?.[0] ?? null
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

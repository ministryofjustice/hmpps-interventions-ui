import ApprovedActionPlanSummary from '../models/approvedActionPlanSummary'

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
}

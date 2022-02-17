import ActionPlan from '../../../models/actionPlan'
import DateUtils from '../../../utils/dateUtils'
import { ActionPlanStatus } from '../../../utils/actionPlanUtils'

export default class ActionPlanSummaryPresenter {
  constructor(
    private readonly actionPlan: ActionPlan | null,
    private readonly userType: 'service-provider' | 'probation-practitioner'
  ) {}

  readonly text = {
    actionPlanSubmittedDate: this.actionPlan?.submittedAt ? DateUtils.formattedDate(this.actionPlan?.submittedAt) : '',
    actionPlanApprovalDate: this.actionPlan?.approvedAt ? DateUtils.formattedDate(this.actionPlan?.approvedAt) : '',
  }

  get actionPlanStatus(): ActionPlanStatus {
    if (this.actionPlanApproved) {
      return ActionPlanStatus.Approved
    }
    if (this.actionPlanUnderReview) {
      return ActionPlanStatus.AwaitingApproval
    }
    if (this.actionPlanCreated && this.userType === 'service-provider') {
      return ActionPlanStatus.InDraft
    }
    return ActionPlanStatus.NotSubmitted
  }

  get actionPlanCreated(): boolean {
    return this.actionPlan !== null
  }

  get actionPlanSubmitted(): boolean {
    return this.actionPlan?.submittedAt != null
  }

  get actionPlanUnderReview(): boolean {
    return this.actionPlanSubmitted && !this.actionPlanApproved
  }

  get actionPlanApproved(): boolean {
    return this.actionPlan?.approvedAt != null
  }
}

import ActionPlan from '../../../../models/actionPlan'
import ActionPlanSummaryPresenter from '../../../shared/action-plan/actionPlanSummaryPresenter'

export default class ActionPlanEditConfirmationPresenter {
  actionPlanSummaryPresenter: ActionPlanSummaryPresenter

  constructor(private readonly actionPlan: ActionPlan) {
    this.actionPlanSummaryPresenter = new ActionPlanSummaryPresenter(actionPlan, 'service-provider')
  }

  readonly viewActionPlanUrl = `/service-provider/referrals/${this.actionPlan.referralId}/action-plan`

  readonly editConfirmAction = `/service-provider/referrals/${this.actionPlan.referralId}/action-plan/edit`

  get text(): { title: string; note: string } {
    if (this.actionPlanSummaryPresenter.actionPlanApproved) {
      return {
        title: 'Are you sure you want to create a new action plan?',
        note: 'Note: Creating a new action plan will overwrite the current one.',
      }
    }

    return {
      title: 'Are you sure you want to change the action plan while it is being reviewed?',
      note: 'Note: This will withdraw the current action plan and the probation practitioner will no longer be able to view it.',
    }
  }
}

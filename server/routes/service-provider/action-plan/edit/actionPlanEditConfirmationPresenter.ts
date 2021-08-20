import ActionPlan from '../../../../models/actionPlan'
import SentReferral from '../../../../models/sentReferral'
import ActionPlanSummaryPresenter from '../../../shared/action-plan/actionPlanSummaryPresenter'

export default class ActionPlanEditConfirmationPresenter {
  actionPlanSummaryPresenter: ActionPlanSummaryPresenter

  constructor(private readonly sentReferral: SentReferral, private readonly actionPlan: ActionPlan) {
    this.actionPlanSummaryPresenter = new ActionPlanSummaryPresenter(sentReferral, actionPlan, 'service-provider')
  }

  readonly viewActionPlanUrl = `/service-provider/referrals/${this.sentReferral.id}/action-plan`

  readonly editConfirmAction = `/service-provider/referrals/${this.sentReferral.id}/action-plan/edit`

  get text(): { title: string; note: string } {
    if (this.actionPlanSummaryPresenter.actionPlanApproved) {
      return {
        title: 'Are you sure you want to create a new action plan?',
        note: 'Note: Creating a new action plan will overwrite the current one once the probation practitioner approves it.',
      }
    }

    return {
      title: 'Are you sure you want to change the action plan while it is being reviewed?',
      note: 'Note: This will withdraw the current action plan and the probation practitioner will no longer be able to view it.',
    }
  }
}

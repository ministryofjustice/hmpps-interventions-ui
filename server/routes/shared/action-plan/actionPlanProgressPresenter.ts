import ActionPlan from '../../../models/actionPlan'
import ApprovedActionPlanSummary from '../../../models/approvedActionPlanSummary'
import ActionPlanSummaryPresenter from './actionPlanSummaryPresenter'

export default class ActionPlanProgressPresenter {
  currentActionPlanSummaryPresenter: ActionPlanSummaryPresenter

  constructor(
    private readonly referralId: string,
    private readonly currentActionPlan: ActionPlan | null,
    readonly approvedActionPlanSummaries: ApprovedActionPlanSummary[],
    readonly userType: 'service-provider' | 'probation-practitioner'
  ) {
    this.currentActionPlanSummaryPresenter = new ActionPlanSummaryPresenter(currentActionPlan, userType)
  }

  readonly tableHeaders = ['Version', 'Status', 'Submitted', 'Approved', 'Action']

  readonly viewCurrentActionPlanUrl = `/${this.userType}/referrals/${this.referralId}/action-plan`

  readonly createNewActionPlanUrl = `/service-provider/referrals/${this.referralId}/action-plan`

  readonly continueInProgressActionPlanUrl = `/service-provider/action-plan/${this.currentActionPlan?.id}/add-activity/1`

  get includeCurrentActionPlanRow(): boolean {
    // if the current action plan is approved, it will be rendered from `approvedActionPlanSummaries`
    if (this.currentActionPlanSummaryPresenter.actionPlanApproved) {
      return false
    }

    // PPs should never see draft action plans
    if (
      this.userType === 'probation-practitioner' &&
      this.currentActionPlanSummaryPresenter.actionPlanCreated &&
      !this.currentActionPlanSummaryPresenter.actionPlanSubmitted
    ) {
      return false
    }

    return true
  }

  get includeCreateActionPlanButton(): boolean {
    return this.userType === 'service-provider'
  }
}

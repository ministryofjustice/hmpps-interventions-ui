import ActionPlan from '../../../models/actionPlan'
import DateUtils from '../../../utils/dateUtils'
import SentReferral from '../../../models/sentReferral'

export default class ActionPlanSummaryPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly actionPlan: ActionPlan | null,
    readonly userType: 'service-provider' | 'probation-practitioner'
  ) {}

  readonly viewActionPlanUrl = `/${this.userType}/referrals/${this.referral.id}/action-plan`

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  // this url is used to pick up action plan creation after it has been started.
  readonly actionPlanFormUrl =
    this.actionPlan !== null ? `/service-provider/action-plan/${this.actionPlan.id}/add-activity/1` : ''

  readonly text = {
    actionPlanStatus: this.actionPlanStatus,
    actionPlanSubmittedDate: this.actionPlan?.submittedAt ? DateUtils.formattedDate(this.actionPlan?.submittedAt) : '',
    actionPlanApprovalDate: this.actionPlan?.approvedAt ? DateUtils.formattedDate(this.actionPlan?.approvedAt) : '',
  }

  private get actionPlanStatus(): string {
    if (this.actionPlanApproved) {
      return 'Approved'
    }
    if (this.actionPlanUnderReview) {
      return 'Awaiting approval'
    }
    if (this.actionPlanCreated && this.userType === 'service-provider') {
      return 'In draft'
    }
    return 'Not submitted'
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

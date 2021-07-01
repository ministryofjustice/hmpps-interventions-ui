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
  // the url points to the screen for adding an additional activity
  readonly actionPlanFormUrl =
    this.actionPlan !== null
      ? `/service-provider/action-plan/${this.actionPlan.id}/add-activity/${this.actionPlan.activities.length + 1}`
      : ''

  readonly text = {
    actionPlanStatus: this.actionPlanStatus,
    actionPlanSubmittedDate: DateUtils.getDateStringFromDateTimeString(this.actionPlan?.submittedAt || null),
    actionPlanApprovalDate: DateUtils.getDateStringFromDateTimeString(this.actionPlan?.approvedAt || null),
  }

  private get actionPlanStatus(): string {
    if (this.actionPlanApproved) {
      return 'Approved'
    }
    if (this.actionPlanUnderReview) {
      return 'Awaiting approval'
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

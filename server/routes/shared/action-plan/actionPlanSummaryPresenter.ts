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

  readonly actionPlanFormUrl = `/service-provider/action-plan/${this.actionPlan?.id}/add-activities`

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

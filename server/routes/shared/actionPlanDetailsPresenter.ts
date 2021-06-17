import ActionPlan from '../../models/actionPlan'
import DateUtils from '../../utils/dateUtils'
import SentReferral from '../../models/sentReferral'

export default class ActionPlanDetailsPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly actionPlan: ActionPlan | null,
    private readonly subNavUrlPrefix: 'service-provider' | 'probation-practitioner'
  ) {}

  readonly interventionProgressURL = `/${this.subNavUrlPrefix}/referrals/${this.referral.id}/progress`

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  readonly viewActionPlanUrl = `/service-provider/referrals/${this.referral.id}/action-plan`

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
      return 'Under review'
    }
    return 'Not submitted'
  }

  get actionPlanCreated(): boolean {
    return this.actionPlan !== null
  }

  get actionPlanUnderReview(): boolean {
    return this.actionPlan?.submittedAt != null && !this.actionPlanApproved
  }

  get actionPlanApproved(): boolean {
    return this.actionPlan?.approvedAt != null
  }
}

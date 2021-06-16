import ActionPlan from '../../models/actionPlan'
import DateUtils from '../../utils/dateUtils'

export default class ActionPlanDetailsPresenter {
  constructor(
    private readonly actionPlan: ActionPlan | null,
    private readonly subNavUrlPrefix: 'service-provider' | 'probation-practitioner'
  ) {}

  readonly interventionProgressURL = `/${this.subNavUrlPrefix}/referrals/${this.actionPlan?.referralId}/progress`

  readonly actionPlanFormUrl = `/service-provider/action-plan/${this.actionPlan?.id}/add-activities`

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.actionPlan?.referralId}/action-plan`

  readonly viewActionPlanUrl = `/service-provider/referrals/${this.actionPlan?.referralId}/action-plan`

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

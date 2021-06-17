import ActionPlan from '../../models/actionPlan'
import DateUtils from '../../utils/dateUtils'
import SentReferral from '../../models/sentReferral'

export default class ActionPlanPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly actionPlan: ActionPlan | null,
    private readonly userType: 'service-provider' | 'probation-practitioner'
  ) {}

  readonly interventionProgressURL = `/${this.userType}/referrals/${this.referral.id}/progress`

  readonly viewActionPlanUrl = `/${this.userType}/referrals/${this.referral.id}/action-plan`

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  readonly actionPlanFormUrl = `/service-provider/action-plan/${this.actionPlan?.id}/add-activities`

  readonly text = {
    actionPlanStatus: this.actionPlanStatus,
    actionPlanSubmittedDate: DateUtils.getDateStringFromDateTimeString(this.actionPlan?.submittedAt || null),
    actionPlanApprovalDate: DateUtils.getDateStringFromDateTimeString(this.actionPlan?.approvedAt || null),
    actionPlanNumberOfSessions: this.actionPlan?.numberOfSessions,
  }

  get activities(): string[] {
    return (
      this.actionPlan?.activities?.map(it => {
        return it.description
      }) || []
    )
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

import ActionPlan from '../../models/actionPlan'
import DateUtils from '../../utils/dateUtils'
import SentReferral from '../../models/sentReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class ActionPlanPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly actionPlan: ActionPlan | null,
    readonly userType: 'service-provider' | 'probation-practitioner',
    private readonly validationError: FormValidationError | null = null
  ) {}

  readonly interventionProgressURL = `/${this.userType}/referrals/${this.referral.id}/progress`

  readonly viewActionPlanUrl = `/${this.userType}/referrals/${this.referral.id}/action-plan`

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  readonly actionPlanFormUrl = `/service-provider/action-plan/${this.actionPlan?.id}/add-activities`

  readonly actionPlanApprovalUrl = `/probation-practitioner/referrals/${this.referral.id}/action-plan/approve`

  readonly text = {
    actionPlanStatus: this.actionPlanStatus,
    actionPlanSubmittedDate: DateUtils.getDateStringFromDateTimeString(this.actionPlan?.submittedAt || null),
    actionPlanApprovalDate: DateUtils.getDateStringFromDateTimeString(this.actionPlan?.approvedAt || null),
    actionPlanNumberOfSessions: this.actionPlan?.numberOfSessions,
    spEmailAddress: this.actionPlan?.submittedBy?.username?.toLowerCase(),
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.validationError)

  readonly fieldErrors = {
    confirmApproval: PresenterUtils.errorMessage(this.validationError, 'confirm-approval'),
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

  get showApprovalForm(): boolean {
    return this.userType === 'probation-practitioner' && this.actionPlanUnderReview
  }
}

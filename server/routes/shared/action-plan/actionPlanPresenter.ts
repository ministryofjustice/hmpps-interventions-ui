import ActionPlan from '../../../models/actionPlan'
import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import ActionPlanSummaryPresenter from './actionPlanSummaryPresenter'

export default class ActionPlanPresenter {
  actionPlanSummaryPresenter: ActionPlanSummaryPresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly actionPlan: ActionPlan,
    readonly userType: 'service-provider' | 'probation-practitioner',
    private readonly validationError: FormValidationError | null = null
  ) {
    this.actionPlanSummaryPresenter = new ActionPlanSummaryPresenter(referral, actionPlan, userType)
  }

  readonly text = {
    actionPlanNumberOfSessions: this.actionPlan?.numberOfSessions,
    spEmailAddress: this.actionPlan?.submittedBy?.username?.toLowerCase(),
  }

  readonly interventionProgressURL = `/${this.userType}/referrals/${this.referral.id}/progress`

  readonly actionPlanApprovalUrl = `/probation-practitioner/referrals/${this.referral.id}/action-plan/approve`

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

  get showApprovalForm(): boolean {
    return this.userType === 'probation-practitioner' && this.actionPlanSummaryPresenter.actionPlanUnderReview
  }
}

import { ActionPlan, SentReferral, ServiceCategory } from '../../services/interventionsService'
import utils from '../../utils/utils'

export default class InterventionProgressPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly actionPlan: ActionPlan | null
  ) {}

  readonly createActionPlanFormAction = `/service-provider/referrals/${this.referral.id}/action-plan`

  readonly text = {
    title: utils.convertToTitleCase(this.serviceCategory.name),
    actionPlanStatus: this.actionPlanSubmitted ? 'Submitted' : 'Not submitted',
  }

  readonly actionPlanStatusStyle: 'active' | 'inactive' = this.actionPlanSubmitted ? 'active' : 'inactive'

  private get actionPlanSubmitted() {
    return this.actionPlan !== null && this.actionPlan.submittedAt !== null
  }
}

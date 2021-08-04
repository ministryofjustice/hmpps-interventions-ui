import ActionPlan from '../../../../models/actionPlan'
import SentReferral from '../../../../models/sentReferral'
import ServiceCategory from '../../../../models/serviceCategory'
import ActionPlanPresenter from '../../../shared/action-plan/actionPlanPresenter'

export default class ReviewActionPlanPresenter {
  actionPlanPresenter: ActionPlanPresenter

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategories: ServiceCategory[],
    private readonly actionPlan: ActionPlan
  ) {
    this.actionPlanPresenter = new ActionPlanPresenter(sentReferral, actionPlan, serviceCategories, 'service-provider')
  }

  readonly actionPlanId = this.actionPlan.id

  readonly submitFormAction = `/service-provider/action-plan/${this.actionPlan.id}/submit`

  readonly text = {
    title: 'Confirm action plan',
    numberOfSessions: this.actionPlan.numberOfSessions?.toString() ?? '',
  }
}

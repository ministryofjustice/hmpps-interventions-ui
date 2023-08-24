import ActionPlan from '../../../../models/actionPlan'
import SentReferral from '../../../../models/sentReferral'
import ServiceCategory from '../../../../models/serviceCategory'
import ActionPlanPresenter from '../../../shared/action-plan/actionPlanPresenter'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class ReviewActionPlanPresenter {
  actionPlanPresenter: ActionPlanPresenter

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategories: ServiceCategory[],
    private readonly actionPlan: ActionPlan,
    private readonly error: FormValidationError | null = null
  ) {
    this.actionPlanPresenter = new ActionPlanPresenter(sentReferral, actionPlan, serviceCategories, 'service-provider')
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly actionPlanId = this.actionPlan.id

  readonly submitFormAction = `/service-provider/action-plan/${this.actionPlan.id}/review`

  readonly text = {
    title: 'Confirm action plan',
    numberOfSessions: this.actionPlan.numberOfSessions?.toString() ?? '',
  }
}

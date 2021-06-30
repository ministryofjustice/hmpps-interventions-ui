import ActionPlan from '../../../../models/actionPlan'
import SentReferral from '../../../../models/sentReferral'
import ServiceCategory from '../../../../models/serviceCategory'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'
import ActionPlanPresenter from '../../../shared/action-plan/actionPlanPresenter'

export default class AddActionPlanActivitiesPresenter {
  actionPlanPresenter: ActionPlanPresenter

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategories: ServiceCategory[],
    private readonly actionPlan: ActionPlan,
    private readonly errors: FormValidationError | null = null
  ) {
    this.actionPlanPresenter = new ActionPlanPresenter(sentReferral, actionPlan, serviceCategories, 'service-provider')
  }

  readonly saveAndContinueFormAction = `/service-provider/action-plan/${this.actionPlan.id}/add-activities`

  readonly addActivityAction = `/service-provider/action-plan/${this.actionPlan.id}/add-activity`

  readonly activityNumber = this.actionPlan.activities.length + 1

  readonly errorMessage = PresenterUtils.errorMessage(this.errors, 'description')

  readonly errorSummary = PresenterUtils.errorSummary(this.errors)

  readonly text = {
    title: `Add activity ${this.activityNumber} to action plan`,
    referredOutcomesHeader: `Referred outcomes for ${this.sentReferral.referral.serviceUser.firstName}`,
  }
}

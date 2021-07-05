import ActionPlan, { Activity } from '../../../../models/actionPlan'
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
    readonly activityNumber: number,
    private readonly errors: FormValidationError | null = null
  ) {
    this.actionPlanPresenter = new ActionPlanPresenter(sentReferral, actionPlan, serviceCategories, 'service-provider')
  }

  readonly saveAndContinueFormAction = `/service-provider/action-plan/${this.actionPlan.id}/add-activities`

  readonly addActivityAction = `/service-provider/action-plan/${this.actionPlan.id}/add-activity/${this.activityNumber}`

  readonly errorMessage = PresenterUtils.errorMessage(this.errors, 'description')

  readonly errorSummary = PresenterUtils.errorSummary(this.errors)

  readonly text = {
    title: `Add activity ${this.activityNumber} to action plan`,
    referredOutcomesHeader: `Referred outcomes for ${this.sentReferral.referral.serviceUser.firstName}`,
  }

  get existingActivity(): Activity | null {
    return this.actionPlanPresenter.orderedActivities[this.activityNumber - 1] || null
  }
}

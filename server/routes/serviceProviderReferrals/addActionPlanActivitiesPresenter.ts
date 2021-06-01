import ActionPlan from '../../models/actionPlan'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import utils from '../../utils/utils'

export default class AddActionPlanActivitiesPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategories: ServiceCategory[],
    private readonly actionPlan: ActionPlan,
    private readonly errors: FormValidationError | null = null
  ) {}

  readonly saveAndContinueFormAction = `/service-provider/action-plan/${this.actionPlan.id}/add-activities`

  readonly addActivityAction = `/service-provider/action-plan/${this.actionPlan.id}/add-activity`

  readonly activityNumber = this.actionPlan.activities.length + 1

  private readonly desiredOutcomesIds = this.sentReferral.referral.desiredOutcomes.flatMap(
    desiredOutcome => desiredOutcome.desiredOutcomesIds
  )

  readonly errorMessage = PresenterUtils.errorMessage(this.errors, 'description')

  readonly errorSummary = PresenterUtils.errorSummary(this.errors)

  // Temporary fix until we update the contracts to stop storing activities against a specific outcome - this will be removed in future
  readonly firstDesiredOutcomeId = this.desiredOutcomesIds[0]

  readonly text = {
    title: `Add activity ${this.activityNumber} to action plan`,
    pageNumber: 1,
    referredOutcomesHeader: `Referred outcomes for ${this.sentReferral.referral.serviceUser.firstName}`,
  }

  readonly desiredOutcomesByServiceCategory = this.serviceCategories.map(serviceCategory => {
    const desiredOutcomesForServiceCategory = serviceCategory.desiredOutcomes.filter(desiredOutcome =>
      this.desiredOutcomesIds.includes(desiredOutcome.id)
    )

    return {
      serviceCategory: utils.convertToProperCase(serviceCategory.name),
      desiredOutcomes: desiredOutcomesForServiceCategory.map(desiredOutcome => desiredOutcome.description),
    }
  })
}

import ActionPlan from '../../models/actionPlan'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import utils from '../../utils/utils'

export default class ReviewActionPlanPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategories: ServiceCategory[],
    private readonly actionPlan: ActionPlan
  ) {}

  readonly submitFormAction = `/service-provider/action-plan/${this.actionPlan.id}/submit`

  private readonly desiredOutcomesIds = this.sentReferral.referral.desiredOutcomes.flatMap(
    desiredOutcome => desiredOutcome.desiredOutcomesIds
  )

  readonly text = {
    title: 'Confirm action plan',
    numberOfSessions: this.actionPlan.numberOfSessions?.toString() ?? '',
    pageNumber: 3,
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

  readonly orderedActivities = this.actionPlan.activities
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .map(activity => activity.description)
}

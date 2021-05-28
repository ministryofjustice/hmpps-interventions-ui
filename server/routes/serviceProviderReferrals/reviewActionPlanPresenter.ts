import ActionPlan, { Activity } from '../../models/actionPlan'
import DesiredOutcome from '../../models/desiredOutcome'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import utils from '../../utils/utils'

export default class ReviewActionPlanPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly actionPlan: ActionPlan
  ) {}

  readonly submitFormAction = `/service-provider/action-plan/${this.actionPlan.id}/submit`

  private readonly desiredOutcomesIds = this.sentReferral.referral.desiredOutcomes.flatMap(
    desiredOutcome => desiredOutcome.desiredOutcomesIds
  )

  readonly text = {
    title: `${utils.convertToProperCase(this.serviceCategory.name)} - create action plan`,
    subTitle: `Review ${this.sentReferral.referral.serviceUser.firstName}’s action plan`,
    numberOfSessions: this.actionPlan.numberOfSessions?.toString() ?? '',
    pageNumber: 3,
  }

  readonly desiredOutcomes = this.desiredOutcomesIds.map(id => {
    const desiredOutcome = this.serviceCategory.desiredOutcomes.find(outcome => id === outcome.id)

    if (!desiredOutcome) {
      throw new Error(`Couldn't find desired outcome with ID ${id}`)
    }

    return {
      description: desiredOutcome.description,
      activities: this.orderedActivitiesForOutcome(desiredOutcome).map(activity => ({ text: activity.description })),
    }
  })

  private orderedActivitiesForOutcome(outcome: DesiredOutcome): Activity[] {
    return this.actionPlan.activities
      .filter(activity => activity.desiredOutcome.id === outcome.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
  }
}

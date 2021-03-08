import { DraftActionPlan, SentReferral, ServiceCategory } from '../../services/interventionsService'
import utils from '../../utils/utils'

export default class AddActionPlanActivitiesPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly actionPlan: DraftActionPlan
  ) {}

  readonly text = {
    title: `${utils.convertToProperCase(this.serviceCategory.name)} - create action plan`,
    subTitle: `Add suggested activities to ${this.sentReferral.referral.serviceUser.firstName}’s action plan`,
  }

  readonly desiredOutcomes = this.sentReferral.referral.desiredOutcomesIds.map(id => {
    const desiredOutcome = this.serviceCategory.desiredOutcomes.find(outcome => id === outcome.id)

    if (!desiredOutcome) {
      return null
    }

    return {
      description: desiredOutcome.description,
      id: desiredOutcome.id,
      addActivityAction: `/service-provider/action-plan/${this.actionPlan.id}/add-activity`,
    }
  })
}

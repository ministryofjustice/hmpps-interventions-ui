import ActionPlan from '../../models/actionPlan'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import { FormValidationError } from '../../utils/formValidationError'
import errorMessages from '../../utils/errorMessages'

export default class FinaliseActionPlanActivitiesForm {
  constructor(
    private readonly referral: SentReferral,
    private readonly actionPlan: ActionPlan,
    private readonly serviceCategory: ServiceCategory
  ) {}

  get isValid(): boolean {
    return this.errors.length === 0
  }

  get errors(): { desiredOutcomeId: string; error: FormValidationError }[] {
    const desiredOutcomeIdsWithoutActivities = this.referral.referral.desiredOutcomesIds.filter(
      desiredOutcomeId => !this.actionPlan.activities.some(activity => activity.desiredOutcome.id === desiredOutcomeId)
    )

    return desiredOutcomeIdsWithoutActivities.map(desiredOutcomeId => {
      const desiredOutcome = this.serviceCategory.desiredOutcomes.find(outcome => desiredOutcomeId === outcome.id)

      return {
        desiredOutcomeId,
        error: {
          errors: [
            {
              formFields: ['description'],
              message: errorMessages.actionPlanActivity.noneAdded(desiredOutcome?.description ?? ''),
              errorSummaryLinkedField: 'description',
            },
          ],
        },
      }
    })
  }
}

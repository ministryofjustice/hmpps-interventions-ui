import {
  ActionPlan,
  Activity,
  DesiredOutcome,
  SentReferral,
  ServiceCategoryFull,
} from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import utils from '../../utils/utils'
import PresenterUtils from '../../utils/presenterUtils'

export default class AddActionPlanActivitiesPresenter {
  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceCategory: ServiceCategoryFull,
    private readonly actionPlan: ActionPlan,
    private readonly errors: { desiredOutcomeId: string; error: FormValidationError }[] = []
  ) {}

  readonly saveAndContinueFormAction = `/service-provider/action-plan/${this.actionPlan.id}/add-activities`

  private readonly desiredOutcomesIds = this.sentReferral.referral.desiredOutcomesIds

  readonly errorSummary = (() => {
    const errorSummary = this.errors.reduce((accumIndexedSummary, error) => {
      const unindexedSummary = PresenterUtils.errorSummary(error.error)
      if (unindexedSummary === null) {
        return accumIndexedSummary
      }

      const index = this.desiredOutcomesIds.indexOf(error.desiredOutcomeId)
      const indexedSummary = unindexedSummary.map(item => ({ ...item, field: `${item.field}-${index + 1}` }))

      return [...accumIndexedSummary, ...indexedSummary]
    }, new Array<{ field: string; message: string }>())

    if (errorSummary.length === 0) {
      return null
    }

    return errorSummary
  })()

  readonly text = {
    title: `${utils.convertToProperCase(this.serviceCategory.name)} - create action plan`,
    pageNumber: 1,
    subTitle: `Add suggested activities to ${this.sentReferral.referral.serviceUser.firstName}’s action plan`,
  }

  readonly desiredOutcomes = this.desiredOutcomesIds.map(id => {
    const desiredOutcome = this.serviceCategory.desiredOutcomes.find(outcome => id === outcome.id)

    if (!desiredOutcome) {
      return null
    }

    return {
      description: desiredOutcome.description,
      id: desiredOutcome.id,
      addActivityAction: `/service-provider/action-plan/${this.actionPlan.id}/add-activity`,
      activities: this.orderedActivitiesForOutcome(desiredOutcome).map(activity => ({ text: activity.description })),
      errorMessage: this.errorMessageForOutcome(desiredOutcome),
    }
  })

  private errorMessageForOutcome(desiredOutcome: DesiredOutcome): string | null {
    const error = this.errors.find(anError => anError.desiredOutcomeId === desiredOutcome.id)?.error ?? null
    return PresenterUtils.errorMessage(error, 'description')
  }

  private orderedActivitiesForOutcome(outcome: DesiredOutcome): Activity[] {
    return this.actionPlan.activities
      .filter(activity => activity.desiredOutcome.id === outcome.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
  }
}

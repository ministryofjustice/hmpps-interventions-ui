import ActionPlan from '../../models/actionPlan'
import { FormValidationError } from '../../utils/formValidationError'
import errorMessages from '../../utils/errorMessages'

export default class FinaliseActionPlanActivitiesForm {
  constructor(private readonly actionPlan: ActionPlan) {}

  get isValid(): boolean {
    return this.actionPlan.activities.length > 0
  }

  get error(): FormValidationError | null {
    if (this.isValid) {
      return null
    }

    return {
      errors: [
        {
          formFields: ['description'],
          message: errorMessages.actionPlanActivity.noneAdded,
          errorSummaryLinkedField: 'description',
        },
      ],
    }
  }
}

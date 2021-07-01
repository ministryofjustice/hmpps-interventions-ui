import { Request } from 'express'
import errorMessages from '../../../../utils/errorMessages'
import { FormValidationError } from '../../../../utils/formValidationError'

export default class AddActionPlanActivitiesForm {
  private constructor(private readonly request: Request) {}

  static async createForm(request: Request): Promise<AddActionPlanActivitiesForm> {
    return new AddActionPlanActivitiesForm(request)
  }

  get activityParamsForUpdate(): Record<string, string> {
    return {
      id: this.request.body['activity-id'],
      description: this.request.body.description,
    }
  }

  get isUpdate(): boolean {
    return this.activityParamsForUpdate.id != null
  }

  get isValid(): boolean {
    return this.request.body.description !== ''
  }

  get error(): FormValidationError | null {
    if (this.isValid) {
      return null
    }

    return {
      errors: [
        {
          errorSummaryLinkedField: 'description',
          formFields: ['description'],
          message: errorMessages.actionPlanActivity.empty,
        },
      ],
    }
  }
}

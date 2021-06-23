import { Request } from 'express'
import { UpdateDraftActionPlanParams } from '../../services/interventionsService'
import errorMessages from '../../utils/errorMessages'
import { FormValidationError } from '../../utils/formValidationError'

export default class AddActionPlanActivitiesForm {
  private constructor(private readonly request: Request) {}

  static async createForm(request: Request): Promise<AddActionPlanActivitiesForm> {
    return new AddActionPlanActivitiesForm(request)
  }

  get activityParamsForUpdate(): Partial<UpdateDraftActionPlanParams> {
    return {
      newActivity: {
        description: this.request.body.description,
      },
    }
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

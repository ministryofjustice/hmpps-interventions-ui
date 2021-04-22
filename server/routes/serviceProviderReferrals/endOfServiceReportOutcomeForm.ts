import * as ExpressValidator from 'express-validator'
import { Request } from 'express'
import { FormData } from '../../utils/forms/formData'
import errorMessages from '../../utils/errorMessages'
import { ServiceUser, UpdateDraftEndOfServiceReportParams } from '../../services/interventionsService'
import FormUtils from '../../utils/formUtils'

export default class EndOfServiceReportOutcomeForm {
  constructor(
    private readonly request: Request,
    private readonly desiredOutcomeId: string,
    private readonly serviceUser: ServiceUser
  ) {}

  async data(): Promise<FormData<Partial<UpdateDraftEndOfServiceReportParams>>> {
    const result = await FormUtils.runValidations({ request: this.request, validations: this.validations })

    const error = FormUtils.validationErrorFromResult(result)
    if (error) {
      return { paramsForUpdate: null, error }
    }

    return {
      paramsForUpdate: {
        outcome: {
          desiredOutcomeId: this.desiredOutcomeId,
          achievementLevel: this.request.body['achievement-level'],
          progressionComments: this.request.body['progression-comments'],
          additionalTaskComments: this.request.body['additional-task-comments'],
        },
      },
      error: null,
    }
  }

  private get validations() {
    return [
      ExpressValidator.body('achievement-level')
        .notEmpty()
        .withMessage(errorMessages.endOfServiceReportOutcome.achievementLevel.empty(this.serviceUser.firstName ?? '')),
    ]
  }
}

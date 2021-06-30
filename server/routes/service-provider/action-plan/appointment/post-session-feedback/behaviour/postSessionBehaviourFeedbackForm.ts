import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import AppointmentBehaviour from '../../../../../../models/appointmentBehaviour'
import errorMessages from '../../../../../../utils/errorMessages'
import FormUtils from '../../../../../../utils/formUtils'
import { FormValidationError } from '../../../../../../utils/formValidationError'
import { FormData } from '../../../../../../utils/forms/formData'

export default class PostSessionBehaviourFeedbackForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AppointmentBehaviour>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: PostSessionBehaviourFeedbackForm.validations,
    })

    const error = this.error(validationResult)

    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {
        behaviourDescription: this.request.body['behaviour-description'],
        notifyProbationPractitioner: this.notifyProbationPractitioner,
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('behaviour-description')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.appointmentBehaviour.descriptionEmpty)
        .bail()
        .trim(),
      body('notify-probation-practitioner')
        .isIn(['yes', 'no'])
        .withMessage(errorMessages.appointmentBehaviour.notifyProbationPractitionerNotSelected),
    ]
  }

  private error(validationResult: Result<ValidationError>): FormValidationError | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return {
      errors: validationResult.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }

  private get notifyProbationPractitioner(): boolean {
    return this.request.body['notify-probation-practitioner'] === 'yes'
  }
}

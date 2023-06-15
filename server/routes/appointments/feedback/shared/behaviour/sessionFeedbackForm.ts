import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import AppointmentSession from '../../../../../models/sessionFeedback'
import errorMessages from '../../../../../utils/errorMessages'
import FormUtils from '../../../../../utils/formUtils'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { FormData } from '../../../../../utils/forms/formData'

export default class SessionFeedbackForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AppointmentSession>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: SessionFeedbackForm.validations,
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
        sessionSummary: this.request.body['session-summary'],
        sessionResponse: this.request.body['session-response'],
        sessionConcerns: this.request.body['session-concerns'],
        notifyProbationPractitioner: this.notifyProbationPractitioner,
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('session-summary')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.appointmentBehaviour.descriptionEmpty)
        .bail()
        .trim(),
      body('session-response')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.appointmentBehaviour.descriptionEmpty)
        .bail()
        .trim(),
      body('notify-probation-practitioner')
        .isIn(['yes', 'no'])
        .withMessage(errorMessages.appointmentBehaviour.notifyProbationPractitionerNotSelected),
      body('session-concerns')
        .if(body('notify-probation-practitioner').equals('yes'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.appointmentBehaviour.descriptionEmpty),
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

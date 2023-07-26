import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import AppointmentSession from '../../../../../models/sessionFeedback'
import errorMessages from '../../../../../utils/errorMessages'
import FormUtils from '../../../../../utils/formUtils'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { FormData } from '../../../../../utils/forms/formData'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'

export default class SessionFeedbackForm {
  constructor(private readonly request: Request, private readonly serviceUser: DeliusServiceUser) {}

  async data(): Promise<FormData<Partial<AppointmentSession>>> {
    const serviceUserName = `${this.serviceUser.name.forename} ${this.serviceUser.name.surname}`
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: SessionFeedbackForm.validations(serviceUserName),
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

  static validations(serviceUserName: string): ValidationChain[] {
    return [
      body('session-summary')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.sessionSummary.empty)
        .bail()
        .trim(),
      body('session-response')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.sessionResponse.empty(serviceUserName))
        .bail()
        .trim(),
      body('notify-probation-practitioner')
        .isIn(['yes', 'no'])
        .withMessage(errorMessages.sessionConcerns.notifyProbationPractitionerNotSelected),
      body('session-concerns')
        .if(body('notify-probation-practitioner').equals('yes'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.sessionConcerns.empty),
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

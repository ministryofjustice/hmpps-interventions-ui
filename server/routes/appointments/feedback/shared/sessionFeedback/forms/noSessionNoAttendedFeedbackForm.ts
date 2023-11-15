import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import AppointmentSession, { NoSessionReasonType } from '../../../../../../models/sessionFeedback'
import FormUtils from '../../../../../../utils/formUtils'
import { FormValidationError } from '../../../../../../utils/formValidationError'
import { FormData } from '../../../../../../utils/forms/formData'
import errorMessages from '../../../../../../utils/errorMessages'

export default class NoSessionNoAttendedFeedbackForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AppointmentSession>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: NoSessionNoAttendedFeedbackForm.validations(),
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
        noAttendanceInformation: this.request.body['no-attendance-information'],
        notifyProbationPractitioner: this.notifyProbationPractitioner,
        sessionConcerns: this.request.body['session-concerns'],
      },
      error: null,
    }
  }

  static validations(): ValidationChain[] {
    return [
      body('no-attendance-information')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.noAttendanceInformation.empty),
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

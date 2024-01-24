import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import AppointmentSession from '../../../../../models/sessionFeedback'
import errorMessages from '../../../../../utils/errorMessages'
import FormUtils from '../../../../../utils/formUtils'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { FormData } from '../../../../../utils/forms/formData'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'

export default class SessionFeedbackForm {
  constructor(
    private readonly request: Request,
    private readonly serviceUser: DeliusServiceUser,
    private readonly isSupplierAssessmentAppointment: boolean
  ) {}

  async data(): Promise<FormData<Partial<AppointmentSession>>> {
    const serviceUserName = `${this.serviceUser.name.forename} ${this.serviceUser.name.surname}`
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: SessionFeedbackForm.validations(serviceUserName, this.isSupplierAssessmentAppointment),
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
        late: this.late,
        lateReason: this.request.body['late-reason'],
        sessionSummary: this.request.body['session-summary'],
        sessionResponse: this.request.body['session-response'],
        sessionConcerns: this.request.body['session-concerns'],
        sessionBehaviour: this.request.body['session-behaviour'],
        notifyProbationPractitionerOfBehaviour: this.notifyProbationPractitionerOfBehaviour,
        notifyProbationPractitionerOfConcerns: this.notifyProbationPractitionerOfConcerns,
        futureSessionPlans: this.request.body['future-session-plans'],
      },
      error: null,
    }
  }

  static validations(serviceUserName: string, isSupplierAssessmentAppointment: boolean): ValidationChain[] {
    return [
      body('session-summary')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.sessionSummary.empty(isSupplierAssessmentAppointment))
        .bail()
        .trim(),
      body('session-response')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.sessionResponse.empty(serviceUserName, isSupplierAssessmentAppointment))
        .bail()
        .trim(),
      body('notify-probation-practitioner')
        .notEmpty()
        .withMessage(errorMessages.notifyProbationPractitioner.notSelected),
      body('session-behaviour')
        .if(body('notify-probation-practitioner').contains('behaviour'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.sessionBehaviour.empty(serviceUserName)),
      body('session-concerns')
        .if(body('notify-probation-practitioner').contains('concerns'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.sessionConcerns.empty),
      body('late').isIn(['yes', 'no']).withMessage(errorMessages.late.optionNotSelected(serviceUserName)),
      body('late-reason')
        .if(body('late').equals('yes'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.lateReason.empty),
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

  private get notifyProbationPractitionerOfBehaviour(): boolean {
    return this.request.body['notify-probation-practitioner'] === 'behaviour'
  }

  private get notifyProbationPractitionerOfConcerns(): boolean {
    return this.request.body['notify-probation-practitioner'] === 'concerns'
  }

  private get late(): boolean {
    return this.request.body.late === 'yes'
  }
}

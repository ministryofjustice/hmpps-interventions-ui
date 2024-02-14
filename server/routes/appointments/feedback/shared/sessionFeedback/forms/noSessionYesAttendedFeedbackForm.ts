import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import AppointmentSession, { NoSessionReasonType } from '../../../../../../models/sessionFeedback'
import FormUtils from '../../../../../../utils/formUtils'
import { FormValidationError } from '../../../../../../utils/formValidationError'
import { FormData } from '../../../../../../utils/forms/formData'
import errorMessages from '../../../../../../utils/errorMessages'

export default class NoSessionYesAttendedFeedbackForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AppointmentSession>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: NoSessionYesAttendedFeedbackForm.validations(),
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
        noSessionReasonType: this.request.body['no-session-reason-type'],
        noSessionReasonPopAcceptable:
          this.request.body['no-session-reason-type'] === NoSessionReasonType.POP_ACCEPTABLE
            ? this.request.body['no-session-reason-pop-acceptable']
            : null,
        noSessionReasonPopUnacceptable:
          this.request.body['no-session-reason-type'] === NoSessionReasonType.POP_UNACCEPTABLE
            ? this.request.body['no-session-reason-pop-unacceptable']
            : null,
        noSessionReasonLogistics:
          this.request.body['no-session-reason-type'] === NoSessionReasonType.LOGISTICS
            ? this.request.body['no-session-reason-logistics']
            : null,
        notifyProbationPractitionerOfConcerns: this.notifyProbationPractitioner,
        sessionConcerns: this.request.body['session-concerns'],
      },
      error: null,
    }
  }

  static validations(): ValidationChain[] {
    return [
      body('no-session-reason-type')
        .isIn(['POP_ACCEPTABLE', 'POP_UNACCEPTABLE', 'LOGISTICS', 'OTHER'])
        .withMessage(errorMessages.noReasonType.empty),
      body('no-session-reason-pop-acceptable')
        .if(body('no-session-reason-type').equals('POP_ACCEPTABLE'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.noReasonType.popAcceptable.empty),
      body('no-session-reason-pop-unacceptable')
        .if(body('no-session-reason-type').equals('POP_UNACCEPTABLE'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.noReasonType.popUnacceptable.empty),
      body('no-session-reason-logistics')
        .if(body('no-session-reason-type').equals('LOGISTICS'))
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.noReasonType.logistics.empty),
      body('notify-probation-practitioner')
        .isIn(['yes', 'no'])
        .withMessage(errorMessages.notifyProbationPractitioner.notSelected),
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

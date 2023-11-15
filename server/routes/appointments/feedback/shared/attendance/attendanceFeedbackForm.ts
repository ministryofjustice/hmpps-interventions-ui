import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import AppointmentAttendanceFormDetails from '../../../../../models/AppointmentAttendanceFormDetails'
import errorMessages from '../../../../../utils/errorMessages'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { FormData } from '../../../../../utils/forms/formData'
import FormUtils from '../../../../../utils/formUtils'

export default class AttendanceFeedbackForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AppointmentAttendanceFormDetails>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AttendanceFeedbackForm.validations,
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
        didSessionHappen: this.request.body['did-session-happen'] === 'yes',
        attended: this.request.body['did-session-happen'] === 'yes' ? 'yes' : this.request.body.attended,
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      body('did-session-happen').isIn(['yes', 'no']).withMessage(errorMessages.didSessionHappen.empty),
      body('attended')
        .if(body('did-session-happen').equals('no'))
        .isIn(['yes', 'no', 'do_not_know'])
        .withMessage(errorMessages.attendedAppointment.empty),
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
}

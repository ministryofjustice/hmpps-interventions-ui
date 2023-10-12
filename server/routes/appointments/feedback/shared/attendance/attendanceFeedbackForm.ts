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
        attended: this.request.body.attended,
        attendanceFailureInformation:
          this.request.body.attended === 'no' ? this.request.body['attendance-failure-information'] : null,
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [
      // body('attended').isIn(['yes', 'late', 'no']).withMessage(errorMessages.attendedAppointment.empty),
      // body('attendance-failure-information')
      //   .if(body('attended').equals('no'))
      //   .notEmpty({ ignore_whitespace: true })
      //   .withMessage(errorMessages.attendanceFailureInformation.empty),
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

import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import { AppointmentAttendance } from '../../services/interventionsService'
import errorMessages from '../../utils/errorMessages'
import { FormValidationError } from '../../utils/formValidationError'
import { FormData } from '../../utils/forms/formData'
import FormUtils from '../../utils/formUtils'

export default class PostSessionAttendanceFeedbackForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<AppointmentAttendance>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: PostSessionAttendanceFeedbackForm.validations,
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
        attended: this.request.body.attended,
        additionalAttendanceInformation: this.request.body['additional-attendance-information'],
      },
      error: null,
    }
  }

  static get validations(): ValidationChain[] {
    return [body('attended').isIn(['yes', 'late', 'no']).withMessage(errorMessages.attendedAppointment.empty)]
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

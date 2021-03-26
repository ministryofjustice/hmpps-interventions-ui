import { Request } from 'express'
import { AppointmentAttendance } from '../../services/interventionsService'
import errorMessages from '../../utils/errorMessages'
import { FormValidationError } from '../../utils/formValidationError'

export default class PostSessionFeedbackForm {
  private constructor(private readonly request: Request) {}

  static async createForm(request: Request): Promise<PostSessionFeedbackForm> {
    return new PostSessionFeedbackForm(request)
  }

  get attendanceParams(): Partial<AppointmentAttendance> {
    return {
      attended: this.request.body.attended,
    }
  }

  get isValid(): boolean {
    return this.request.body.attended !== null && this.request.body.attended !== undefined
  }

  get error(): FormValidationError | null {
    if (this.isValid) {
      return null
    }

    return {
      errors: [
        {
          formFields: ['attended'],
          errorSummaryLinkedField: 'attended',
          message: errorMessages.attendedAppointment.empty,
        },
      ],
    }
  }
}

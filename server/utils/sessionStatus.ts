import { ActionPlanAppointment } from '../models/actionPlan'
import Appointment from '../models/appointment'
import AppointmentDecorator from '../decorators/appointmentDecorator'

export enum SessionStatus {
  notScheduled,
  scheduled,
  awaitingFeedback,
  completed,
  didNotAttend,
}
export default {
  forAppointment: (appointment: Appointment | ActionPlanAppointment | null): SessionStatus => {
    if (appointment === null) {
      return SessionStatus.notScheduled
    }
    const appointmentDecorator = new AppointmentDecorator(appointment)
    if (appointment.sessionFeedback.submitted) {
      const sessionFeedbackAttendance = appointment.sessionFeedback.attendance
      if (sessionFeedbackAttendance.attended === 'no') {
        return SessionStatus.didNotAttend
      }

      if (sessionFeedbackAttendance.attended === 'yes' || sessionFeedbackAttendance.attended === 'late') {
        return SessionStatus.completed
      }
    }

    if (appointment.appointmentTime) {
      if (
        appointmentDecorator.isInitialAssessmentAppointment(appointment) &&
        appointmentDecorator.appointmentIsInThePast(appointment)
      ) {
        return SessionStatus.awaitingFeedback
      }
      return SessionStatus.scheduled
    }

    return SessionStatus.notScheduled
  },
}

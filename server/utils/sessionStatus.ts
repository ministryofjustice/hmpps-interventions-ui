import { ActionPlanAppointment } from '../models/actionPlan'
import Appointment from '../models/appointment'

export enum SessionStatus {
  notScheduled,
  scheduled,
  completed,
  didNotAttend,
}

export default {
  forAppointment: (appointment: Appointment | ActionPlanAppointment | null): SessionStatus => {
    if (appointment === null) {
      return SessionStatus.notScheduled
    }

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
      return SessionStatus.scheduled
    }

    return SessionStatus.notScheduled
  },
}

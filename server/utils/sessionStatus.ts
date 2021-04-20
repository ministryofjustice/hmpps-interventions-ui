import { ActionPlanAppointment } from '../services/interventionsService'

export enum SessionStatus {
  notScheduled,
  scheduled,
  completed,
  didNotAttend,
}

export default {
  forAppointment: (appointment: ActionPlanAppointment): SessionStatus => {
    const sessionFeedbackAttendance = appointment.sessionFeedback.attendance

    if (sessionFeedbackAttendance.attended === 'no') {
      return SessionStatus.didNotAttend
    }

    if (sessionFeedbackAttendance.attended === 'yes' || sessionFeedbackAttendance.attended === 'late') {
      return SessionStatus.completed
    }

    if (appointment.appointmentTime) {
      return SessionStatus.scheduled
    }

    return SessionStatus.notScheduled
  },
}

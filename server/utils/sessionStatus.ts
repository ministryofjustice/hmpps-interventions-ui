import { ActionPlanAppointment } from '../models/actionPlan'
import Appointment from '../models/appointment'

export enum SessionStatus {
  notScheduled,
  scheduled,
  awaitingFeedback,
  completed,
  didNotAttend,
}
function appointmentIsInThePast(appointment: Appointment | ActionPlanAppointment): boolean {
  return new Date(appointment.appointmentTime!) < new Date()
}
function appointmentIsInitialAssessment(appointment: Appointment | ActionPlanAppointment): appointment is Appointment {
  return (<ActionPlanAppointment>appointment).sessionNumber === undefined
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
      if (appointmentIsInitialAssessment(appointment) && appointmentIsInThePast(appointment)) {
        return SessionStatus.awaitingFeedback
      }
      return SessionStatus.scheduled
    }

    return SessionStatus.notScheduled
  },
}

import AppointmentDecorator from '../decorators/appointmentDecorator'
import { InitialAssessmentAppointment, ActionPlanAppointment } from '../models/appointment'

export enum SessionStatus {
  notScheduled,
  scheduled,
  awaitingFeedback,
  completed,
  didNotAttend,
  didNotHappen,
}
export default {
  forAppointment: (appointment: InitialAssessmentAppointment | ActionPlanAppointment | null): SessionStatus => {
    if (appointment === null) {
      return SessionStatus.notScheduled
    }
    const appointmentDecorator = new AppointmentDecorator(appointment)
    if (appointment.appointmentFeedback.submitted) {
      const sessionFeedbackAttendance = appointment.appointmentFeedback.attendanceFeedback
      if (appointment.appointmentFeedback.attendanceFeedback.didSessionHappen === true) {
        return SessionStatus.completed
      }
      if (appointment.appointmentFeedback.attendanceFeedback.didSessionHappen === false) {
        if (sessionFeedbackAttendance.attended === 'no') {
          return SessionStatus.didNotAttend
        }
        if (sessionFeedbackAttendance.attended === 'yes' || sessionFeedbackAttendance.attended === 'do_not_know') {
          return SessionStatus.didNotHappen
        }
      }

      // The 2 checks below are to ensure old appointments still work as expected
      if (sessionFeedbackAttendance.attended === 'no') {
        return SessionStatus.didNotAttend
      }

      if (sessionFeedbackAttendance.attended === 'yes') {
        return SessionStatus.completed
      }
    }

    if (appointment.appointmentTime) {
      if (appointmentDecorator.appointmentIsInThePast(appointment)) {
        return SessionStatus.awaitingFeedback
      }
      return SessionStatus.scheduled
    }

    return SessionStatus.notScheduled
  },
}

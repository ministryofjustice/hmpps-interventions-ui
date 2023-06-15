import AppointmentDecorator from '../decorators/appointmentDecorator'
import { InitialAssessmentAppointment, ActionPlanAppointment } from '../models/appointment'

export enum SessionStatus {
  notScheduled,
  scheduled,
  awaitingFeedback,
  completed,
  didNotAttend,
}
export default {
  forAppointment: (appointment: InitialAssessmentAppointment | ActionPlanAppointment | null): SessionStatus => {
    if (appointment === null) {
      return SessionStatus.notScheduled
    }
    const appointmentDecorator = new AppointmentDecorator(appointment)
    console.log(appointment)
    if (appointment.appointmentFeedback.submitted) {
      console.log("got here 1")
      const sessionFeedbackAttendance = appointment.appointmentFeedback.attendanceFeedback
      if (sessionFeedbackAttendance.attended === 'no') {
        return SessionStatus.didNotAttend
      }
      console.log("got here 2")
      if (sessionFeedbackAttendance.attended === 'yes' || sessionFeedbackAttendance.attended === 'late') {
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

import AppointmentAttendance from './appointmentAttendance'
import AppointmentBehaviour from './appointmentBehaviour'

export default interface SessionFeedback {
  attendance: AppointmentAttendance
  behaviour: AppointmentBehaviour
  submitted: boolean
}

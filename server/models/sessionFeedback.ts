import AppointmentAttendance from './appointmentAttendance'
import AppointmentBehaviour from './appointmentBehaviour'
import User from './hmppsAuth/user'

export default interface SessionFeedback {
  attendance: AppointmentAttendance
  behaviour: AppointmentBehaviour
  submitted: boolean
  submittedBy: User | null
}

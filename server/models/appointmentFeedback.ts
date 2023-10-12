import AppointmentAttendance from './appointmentAttendance'
import User from './hmppsAuth/user'
import SessionFeedback from './sessionFeedback'

export default interface AppointmentFeedback {
  didSessionHappen: boolean | null
  attendanceFeedback: AppointmentAttendance
  sessionFeedback: SessionFeedback
  submitted: boolean
  submittedBy: User | null
}

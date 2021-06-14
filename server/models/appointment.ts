import AppointmentAttendance from './appointmentAttendance'
import AppointmentBehaviour from './appointmentBehaviour'

export default interface Appointment {
  appointmentTime: string | null
  durationInMinutes: number | null
  sessionFeedback: {
    attendance: AppointmentAttendance
    behaviour: AppointmentBehaviour
    submitted: boolean
  }
}

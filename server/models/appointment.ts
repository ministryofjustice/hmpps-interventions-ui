import SessionFeedback from './sessionFeedback'

export default interface Appointment {
  id: string
  appointmentTime: string
  durationInMinutes: number
  sessionFeedback: SessionFeedback
}

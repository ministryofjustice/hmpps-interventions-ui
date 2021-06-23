import Address from './address'
import { AppointmentDeliveryType } from './appointmentDeliveryType'
import SessionFeedback from './sessionFeedback'

export default interface Appointment {
  id: string
  appointmentTime: string
  durationInMinutes: number
  appointmentDeliveryType: AppointmentDeliveryType
  appointmentDeliveryAddress: Address | null
  sessionFeedback: SessionFeedback
}

import Address from './address'
import { AppointmentDeliveryType } from './appointmentDeliveryType'
import SessionFeedback from './sessionFeedback'

export interface InitialAssessmentAppointment extends Appointment {
  id: string
}

export interface ActionPlanAppointment extends Appointment {
  sessionNumber: number
}

interface Appointment extends AppointmentSchedulingDetails {
  sessionFeedback: SessionFeedback
}

export interface AppointmentSchedulingDetails {
  appointmentTime: string | null
  durationInMinutes: number | null
  appointmentDeliveryType: AppointmentDeliveryType | null
  appointmentDeliveryAddress: Address | null
}

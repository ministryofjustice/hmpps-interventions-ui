import Address from './address'
import { AppointmentDeliveryType } from './appointmentDeliveryType'
import SessionFeedback from './sessionFeedback'
import { SessionType } from './sessionType'

export interface InitialAssessmentAppointment extends Appointment {
  id: string
}

export interface ActionPlanAppointment extends Appointment {
  id: string
  sessionNumber: number
}

interface Appointment extends AppointmentSchedulingDetails {
  sessionFeedback: SessionFeedback
}

export interface AppointmentSchedulingDetails {
  appointmentTime: string | null
  durationInMinutes: number | null
  sessionType: SessionType | null
  appointmentDeliveryType: AppointmentDeliveryType | null
  appointmentDeliveryAddress: Address | null
  npsOfficeCode: string | null
}

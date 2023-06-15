import Address from './address'
import { AppointmentDeliveryType } from './appointmentDeliveryType'
import SessionFeedback from './appointmentFeedback'
import { SessionType } from './sessionType'
import AppointmentFeedback from "./appointmentFeedback";

export interface InitialAssessmentAppointment extends Appointment {
  id: string
}

export interface ActionPlanAppointment extends Appointment {
  sessionNumber: number
  oldAppointments?: Appointment[]
}

interface Appointment extends AppointmentSchedulingDetails {
  id?: string
  appointmentFeedback: AppointmentFeedback
}

export interface AppointmentSchedulingDetails {
  appointmentTime: string | null
  durationInMinutes: number | null
  sessionType: SessionType | null
  appointmentDeliveryType: AppointmentDeliveryType | null
  appointmentDeliveryAddress: Address | null
  npsOfficeCode: string | null
}

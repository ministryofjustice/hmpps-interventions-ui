import Address from './address'
import { AppointmentDeliveryType } from './appointmentDeliveryType'
import AppointmentFeedback from './appointmentFeedback'
import { SessionType } from './sessionType'

export interface InitialAssessmentAppointment extends Appointment {
  id: string
}

export interface ActionPlanAppointment extends Appointment {
  sessionNumber: number
  currentAppointment?: Appointment
  oldAppointments?: Appointment[]
}

interface Appointment extends AppointmentSchedulingDetails {
  appointmentId?: string
  id?: string // This is the same as above. In some cases the service returns as id(appointmentDTO), in others appointmentId(deliverySessionDTO) This needs changing!
  appointmentFeedback: AppointmentFeedback
  superseded?: boolean
}

export interface AppointmentSchedulingDetails {
  appointmentTime: string | null
  durationInMinutes: number | null
  sessionType: SessionType | null
  appointmentDeliveryType: AppointmentDeliveryType | null
  appointmentDeliveryAddress: Address | null
  npsOfficeCode: string | null
  rescheduleRequestedBy?: string
  rescheduledReason?: string
}

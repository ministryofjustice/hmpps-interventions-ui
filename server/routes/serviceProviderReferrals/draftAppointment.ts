import { DraftAppointmentFeedbackDetails } from './draftAppointmentFeedback'
import { AppointmentSchedulingDetails } from '../../models/appointment'

export type AppointmentDetails = DraftAppointmentBooking & {
  session?: DraftAppointmentFeedbackDetails
}

export type DraftAppointment = null | AppointmentDetails

export type DraftAppointmentBooking = null | AppointmentSchedulingDetails

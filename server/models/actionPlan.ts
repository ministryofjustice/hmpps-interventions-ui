import Address from './address'
import { AppointmentDeliveryType } from './appointmentDeliveryType'
import User from './hmppsAuth/user'
import SessionFeedback from './sessionFeedback'

export interface Activity {
  id: string
  description: string
  createdAt: string
}

export interface ActionPlanAppointment {
  sessionNumber: number
  appointmentTime: string | null
  durationInMinutes: number | null
  appointmentDeliveryType: AppointmentDeliveryType | null
  appointmentDeliveryAddress: Address | null
  sessionFeedback: SessionFeedback
}

export default interface ActionPlan {
  id: string
  referralId: string
  numberOfSessions: number | null
  activities: Activity[]
  submittedBy: User | null
  submittedAt: string | null
  approvedBy: User | null
  approvedAt: string | null
}

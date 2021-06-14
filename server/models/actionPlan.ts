import User from './hmppsAuth/user'
import DesiredOutcome from './desiredOutcome'
import Appointment from './appointment'

export interface Activity {
  id: string
  desiredOutcome: DesiredOutcome
  description: string
  createdAt: string
}

export interface ActionPlanAppointment extends Appointment {
  sessionNumber: number
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

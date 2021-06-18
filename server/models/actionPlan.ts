import User from './hmppsAuth/user'
import DesiredOutcome from './desiredOutcome'
import SessionFeedback from './sessionFeedback'

export interface Activity {
  id: string
  desiredOutcome: DesiredOutcome
  description: string
  createdAt: string
}

export interface ActionPlanAppointment {
  sessionNumber: number
  appointmentTime: string | null
  durationInMinutes: number | null
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

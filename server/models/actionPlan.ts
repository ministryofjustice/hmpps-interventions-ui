import User from './hmppsAuth/user'

export interface Activity {
  id: string
  description: string
  createdAt: string
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

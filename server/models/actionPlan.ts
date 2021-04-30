import User from './hmppsAuth/user'
import DesiredOutcome from './desiredOutcome'

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
  sessionFeedback: {
    attendance: AppointmentAttendance
    behaviour: AppointmentBehaviour
    submitted: boolean
  }
}

export type Attended = 'yes' | 'no' | 'late' | null

export interface AppointmentAttendance {
  attended: Attended
  additionalAttendanceInformation: string | null
}

export interface AppointmentBehaviour {
  behaviourDescription: string | null
  notifyProbationPractitioner: boolean | null
}

export default interface ActionPlan {
  id: string
  referralId: string
  numberOfSessions: number | null
  activities: Activity[]
  submittedBy: User | null
  submittedAt: string | null
}

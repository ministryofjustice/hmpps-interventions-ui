import User from '../../models/hmppsAuth/user'
import { NoSessionReasonType } from '../../models/sessionFeedback'

// Warning: We have copied from appointmentFeedback.ts because it decouples the model from the REDIS draft object.
// The REDIS draft object may have some drafts in flight when making changes, so care must be taken to ensure that the object
// is never modified only appended to.
export interface DraftAppointmentFeedbackDetails {
  attendanceFeedback: {
    didSessionHappen: boolean | null
    attended: 'yes' | 'no' | 'do_not_know' | null
    attendanceFailureInformation: string | null
  }
  sessionFeedback: {
    late: boolean | null
    lateReason: string | null
    notifyProbationPractitioner: boolean | null
    sessionSummary: string | null
    sessionResponse: string | null
    sessionConcerns: string | null
    futureSessionPlans: string | null
    noSessionReasonType: NoSessionReasonType | null
    noSessionReasonPopAcceptable: string | null
    noSessionReasonPopUnacceptable: string | null
    noSessionReasonLogistics: string | null
    // noSessionReasonOther: string | null
    noAttendanceInformation: string | null
  }
  submitted: boolean
  submittedBy: User | null
}

import User from '../../models/hmppsAuth/user'

// Warning: We have copied from appointmentFeedback.ts because it decouples the model from the REDIS draft object.
// The REDIS draft object may have some drafts in flight when making changes, so care must be taken to ensure that the object
// is never modified only appended to.
export interface DraftAppointmentFeedbackDetails {
  attendanceFeedback: {
    attended: 'yes' | 'no' | 'late' | null
    additionalAttendanceInformation: string | null
  }
  sessionFeedback: {
    // behaviourDescription: string | null
    notifyProbationPractitioner: boolean | null
    sessionSummary:  string | null //is this correct?
    sessionResponse: string | null
    sessionConcerns: string | null
  }
  submitted: boolean
  submittedBy: User | null
}

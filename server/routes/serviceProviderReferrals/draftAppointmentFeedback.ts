import User from '../../models/hmppsAuth/user'

// Warning: We have copied from sessionFeedback.ts because it decouples the model from the REDIS draft object.
// The REDIS draft object may have some drafts in flight when making changes, so care must be taken to ensure that the object
// is never modified only appended to.
export interface DraftAppointmentFeedbackDetails {
  attendance: {
    attended: 'yes' | 'no' | 'late' | null
    additionalAttendanceInformation: string | null
  }
  behaviour: {
    behaviourDescription: string | null
    notifyProbationPractitioner: boolean | null
  }
  submitted: boolean
  submittedBy: User | null
}

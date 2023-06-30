import { Factory } from 'fishery'
import { DraftAppointment } from '../../server/routes/serviceProviderReferrals/draftAppointment'
import { AppointmentDeliveryType } from '../../server/models/appointmentDeliveryType'
import { SessionType } from '../../server/models/sessionType'
import { Attended } from '../../server/models/appointmentAttendance'
import userDetailsFactory from './userDetails'
import User from '../../server/models/hmppsAuth/user'

class DraftAppointmentFactory extends Factory<DraftAppointment> {
  withAttendanceFeedback(attended: Attended = 'yes') {
    return this.params({
      session: {
        attendanceFeedback: {
          attended,
        },
        sessionFeedback: {
          sessionSummary: null,
          sessionResponse: null,
          notifyProbationPractitioner: null,
          sessionConcerns: null,
        },
        submitted: false,
        submittedBy: null,
      },
    })
  }

  withBehaviourFeedback(attended: Attended = 'yes') {
    return this.params({
      session: {
        attendanceFeedback: {
          attended,
        },
        sessionFeedback: {
          sessionSummary: null,
          sessionResponse: null,
          notifyProbationPractitioner: null,
          sessionConcerns: null,
        },
        submitted: false,
        submittedBy: null,
      },
    })
  }

  withSubmittedFeedback(
    attended: Attended = 'yes',
    sessionSummary = 'stub session summary',
    sessionResponse = 'stub session summary',
    notifyProbationPractitioner = false,
    submitted = true,
    submittedBy: User = userDetailsFactory.build()
  ) {
    return this.params({
      session: {
        attendanceFeedback: {
          attended,
        },
        sessionFeedback: {
          sessionSummary,
          sessionResponse,
          notifyProbationPractitioner,
          sessionConcerns: null,
        },
        submitted,
        submittedBy,
      },
    })
  }
}

const defaultAppointmentDeliveryType: AppointmentDeliveryType = 'PHONE_CALL'
const defaultSessionType: SessionType = 'ONE_TO_ONE'

export default DraftAppointmentFactory.define(() => ({
  appointmentDeliveryAddress: null,
  appointmentTime: '2021-02-01T13:00:00Z',
  durationInMinutes: 60,
  appointmentDeliveryType: defaultAppointmentDeliveryType,
  npsOfficeCode: null,
  sessionType: defaultSessionType,
  sessionFeedback: {
    attendanceFeedback: {
      attended: null,
      attendanceFailureInformation: null,
    },
    sessionFeedback: {
      behaviourDescription: null,
      notifyProbationPractitioner: null,
      sessionSummary: null,
      sessionResponse: null,
      sessionConcerns: null,
    },
    submitted: false,
    submittedBy: null,
  },
}))

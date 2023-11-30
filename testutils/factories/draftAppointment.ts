import { Factory } from 'fishery'
import { DraftAppointment } from '../../server/routes/serviceProviderReferrals/draftAppointment'
import { AppointmentDeliveryType } from '../../server/models/appointmentDeliveryType'
import { SessionType } from '../../server/models/sessionType'
import { Attended } from '../../server/models/appointmentAttendance'
import userDetailsFactory from './userDetails'
import User from '../../server/models/hmppsAuth/user'
import { NoSessionReasonType } from '../../server/models/sessionFeedback'

class DraftAppointmentFactory extends Factory<DraftAppointment> {
  withAttendanceFeedback(attended: Attended = 'yes') {
    return this.params({
      session: {
        attendanceFeedback: {
          attended,
          didSessionHappen: true,
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

  withBehaviourFeedback(
    attended: Attended = 'yes',
    didSessionHappen = true,
    late: boolean | null = false,
    lateReason: string | null = null,
    sessionSummary: string | null = null,
    sessionResponse: string | null = null,
    notifyProbationPractitioner: boolean | null = null,
    sessionConcerns: string | null = null,
    noSessionReasonType: NoSessionReasonType | null = null,
    noSessionReasonPopAcceptable: string | null = null,
    noSessionReasonPopUnacceptable: string | null = null,
    noSessionReasonLogistics: string | null = null,
    noAttendanceInformation: string | null = null
  ) {
    return this.params({
      session: {
        attendanceFeedback: {
          attended,
          didSessionHappen,
        },
        sessionFeedback: {
          late,
          lateReason,
          sessionSummary,
          sessionResponse,
          notifyProbationPractitioner,
          sessionConcerns,
          noSessionReasonType,
          noSessionReasonPopAcceptable,
          noSessionReasonPopUnacceptable,
          noSessionReasonLogistics,
          noAttendanceInformation,
        },
        submitted: false,
        submittedBy: null,
      },
    })
  }

  withSubmittedFeedback(
    attended: Attended = 'yes',
    didSessionHappen = true,
    late = false,
    lateReason = null,
    sessionSummary = 'stub session summary',
    sessionResponse = 'stub session summary',
    notifyProbationPractitioner = false,
    submitted = true,
    submittedBy: User = userDetailsFactory.build()
  ) {
    return this.params({
      session: {
        attendanceFeedback: {
          didSessionHappen,
          attended,
        },
        sessionFeedback: {
          late,
          lateReason,
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
      didSessionHappen: null,
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

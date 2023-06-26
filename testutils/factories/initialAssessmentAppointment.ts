import { Factory } from 'fishery'
import { InitialAssessmentAppointment } from '../../server/models/appointment'
import { Attended } from '../../server/models/appointmentAttendance'
import { AppointmentDeliveryType } from '../../server/models/appointmentDeliveryType'
import { SessionType } from '../../server/models/sessionType'

class InitialAssessmentAppointmentFactory extends Factory<InitialAssessmentAppointment> {
  newlyBooked() {
    return this.params({})
  }

  attended(attendance: Attended) {
    return this.params({
      appointmentFeedback: {
        attendanceFeedback: {
          attended: attendance,
          additionalAttendanceInformation: '',
        },
        sessionFeedback: {
          sessionSummary: '',
          sessionResponse: '',
          sessionConcerns: null,
          notifyProbationPractitioner: false,
        },
        submitted: true,
        submittedBy: {
          username: 'UserABC',
          userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
          authSource: 'auth',
        },
      },
    })
  }

  get phoneCall(): InitialAssessmentAppointmentFactory {
    return this.params({ appointmentDeliveryType: 'PHONE_CALL', appointmentDeliveryAddress: null })
  }

  get videoCall(): InitialAssessmentAppointmentFactory {
    return this.params({ appointmentDeliveryType: 'VIDEO_CALL', appointmentDeliveryAddress: null })
  }

  inPersonDeliusOfficeLocation(npsOfficeCode: string): InitialAssessmentAppointmentFactory {
    return this.params({
      appointmentDeliveryType: 'IN_PERSON_MEETING_PROBATION_OFFICE',
      npsOfficeCode,
    })
  }

  get inPersonOtherWithFullAddress(): InitialAssessmentAppointmentFactory {
    return this.params({
      appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
      appointmentDeliveryAddress: {
        firstAddressLine: 'Harmony Living Office, Room 4',
        secondAddressLine: '44 Bouverie Road',
        townOrCity: 'Blackpool',
        county: 'Lancashire',
        postCode: 'SY40RE',
      },
    })
  }

  get inThePast(): InitialAssessmentAppointmentFactory {
    return this.params({
      // one day in the past
      appointmentTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  get inTheFuture(): InitialAssessmentAppointmentFactory {
    return this.params({
      // one day in the future
      appointmentTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }
}

const defaultAppointmentDeliveryType: AppointmentDeliveryType = 'VIDEO_CALL'
const defaultSessionType: SessionType = 'ONE_TO_ONE'

export default InitialAssessmentAppointmentFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  // one day in the future
  appointmentTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  durationInMinutes: 60,
  sessionType: defaultSessionType,
  // For some reason the compiler complains if I write 'VIDEO_CALL' inline
  appointmentDeliveryType: defaultAppointmentDeliveryType,
  appointmentDeliveryAddress: null,
  npsOfficeCode: null,
  appointmentFeedback: {
    attendanceFeedback: {
      attended: null,
      additionalAttendanceInformation: null,
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

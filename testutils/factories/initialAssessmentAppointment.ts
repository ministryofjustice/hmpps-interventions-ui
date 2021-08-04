import { Factory } from 'fishery'
import { InitialAssessmentAppointment } from '../../server/models/appointment'
import { Attended } from '../../server/models/appointmentAttendance'
import { AppointmentDeliveryType } from '../../server/models/appointmentDeliveryType'

class InitialAssessmentAppointmentFactory extends Factory<InitialAssessmentAppointment> {
  newlyBooked() {
    return this.params({})
  }

  attended(attendance: Attended) {
    return this.params({
      sessionFeedback: {
        attendance: {
          attended: attendance,
          additionalAttendanceInformation: '',
        },
        behaviour: {
          behaviourDescription: '',
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

export default InitialAssessmentAppointmentFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  // one day in the future
  appointmentTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  durationInMinutes: 60,
  // For some reason the compiler complains if I write 'VIDEO_CALL' inline
  appointmentDeliveryType: defaultAppointmentDeliveryType,
  appointmentDeliveryAddress: null,
  sessionFeedback: {
    attendance: {
      attended: null,
      additionalAttendanceInformation: null,
    },
    behaviour: {
      behaviourDescription: null,
      notifyProbationPractitioner: null,
    },
    submitted: false,
    submittedBy: null,
  },
}))

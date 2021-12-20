import { Factory } from 'fishery'
import { DraftAppointment } from '../../server/routes/serviceProviderReferrals/draftAppointment'
import { AppointmentDeliveryType } from '../../server/models/appointmentDeliveryType'
import { SessionType } from '../../server/models/sessionType'
import { Attended } from '../../server/models/appointmentAttendance'
import userDetailsFactory from './userDetails'
import User from '../../server/models/hmppsAuth/user'

class DraftAppointmentFactory extends Factory<DraftAppointment> {
  withAttendanceFeedback(
    attended: Attended = 'yes',
    additionalAttendanceInformation = 'Alex made the session on time'
  ) {
    return this.params({
      sessionFeedback: {
        attendance: {
          attended,
          additionalAttendanceInformation,
        },
        behaviour: {
          behaviourDescription: null,
          notifyProbationPractitioner: null,
        },
        submitted: false,
        submittedBy: null,
      },
    })
  }

  withBehaviourFeedback(
    attended: Attended = 'yes',
    additionalAttendanceInformation = 'Alex made the session on time',
    behaviourDescription = 'Alex was well-behaved',
    notifyProbationPractitioner = false
  ) {
    return this.params({
      sessionFeedback: {
        attendance: {
          attended,
          additionalAttendanceInformation,
        },
        behaviour: {
          behaviourDescription,
          notifyProbationPractitioner,
        },
        submitted: false,
        submittedBy: null,
      },
    })
  }

  withSubmittedFeedback(
    attended: Attended = 'yes',
    additionalAttendanceInformation = 'Alex made the session on time',
    behaviourDescription = 'Alex was well-behaved',
    notifyProbationPractitioner = false,
    submitted = true,
    submittedBy: User = userDetailsFactory.build()
  ) {
    return this.params({
      sessionFeedback: {
        attendance: {
          attended,
          additionalAttendanceInformation,
        },
        behaviour: {
          behaviourDescription,
          notifyProbationPractitioner,
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

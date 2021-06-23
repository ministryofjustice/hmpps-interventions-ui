import { Factory } from 'fishery'
import Appointment from '../../server/models/appointment'
import { Attended } from '../../server/models/appointmentAttendance'
import { AppointmentDeliveryType } from '../../server/models/appointmentDeliveryType'

class AppointmentFactory extends Factory<Appointment> {
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
      },
    })
  }
}

const defaultAppointmentDeliveryType: AppointmentDeliveryType = 'VIDEO_CALL'

export default AppointmentFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  appointmentTime: new Date().toISOString(),
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
  },
}))

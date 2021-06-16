import { Factory } from 'fishery'
import Appointment from '../../server/models/appointment'
import { Attended } from '../../server/models/appointmentAttendance'

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

export default AppointmentFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  appointmentTime: new Date().toISOString(),
  durationInMinutes: 60,
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

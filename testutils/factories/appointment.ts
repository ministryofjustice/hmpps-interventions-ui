import { Factory } from 'fishery'
import Appointment from '../../server/models/appointment'
import { Attended } from '../../server/models/appointmentAttendance'

class AppointmentFactory extends Factory<Appointment> {
  newlyCreated() {
    return this.params({})
  }

  scheduled() {
    return this.params({
      appointmentTime: new Date().toISOString(),
      durationInMinutes: 60,
    })
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

export default AppointmentFactory.define(() => ({
  appointmentTime: null,
  durationInMinutes: null,
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

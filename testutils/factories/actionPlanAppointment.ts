import { Factory } from 'fishery'
import { ActionPlanAppointment, Attended } from '../../server/services/interventionsService'

class ActionPlanAppointmentFactory extends Factory<ActionPlanAppointment> {
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

export default ActionPlanAppointmentFactory.define(() => ({
  sessionNumber: 1,
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

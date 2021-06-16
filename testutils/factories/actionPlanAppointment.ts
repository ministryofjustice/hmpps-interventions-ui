import { Factory } from 'fishery'
import { ActionPlanAppointment } from '../../server/models/actionPlan'
import { Attended } from '../../server/models/appointmentAttendance'
import appointmentFactory from './appointment'

class ActionPlanAppointmentFactory extends Factory<ActionPlanAppointment> {
  newlyCreated() {
    return this
  }

  scheduled() {
    return this.params({
      ...appointmentFactory.newlyBooked().build(),
    })
  }

  attended(attendance: Attended) {
    return this.params({
      sessionFeedback: appointmentFactory.attended(attendance).build().sessionFeedback,
    })
  }
}

export default ActionPlanAppointmentFactory.define(() => ({
  appointmentTime: null,
  durationInMinutes: null,
  sessionFeedback: appointmentFactory.newlyBooked().build().sessionFeedback,
  sessionNumber: 1,
}))

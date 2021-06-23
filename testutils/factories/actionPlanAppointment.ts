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
  sessionNumber: 1,
  appointmentTime: null,
  durationInMinutes: null,
  appointmentDeliveryType: null,
  appointmentDeliveryAddress: null,
  sessionFeedback: appointmentFactory.newlyBooked().build().sessionFeedback,
}))

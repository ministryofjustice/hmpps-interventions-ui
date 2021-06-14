import { Factory } from 'fishery'
import { ActionPlanAppointment } from '../../server/models/actionPlan'
import { Attended } from '../../server/models/appointmentAttendance'
import appointmentFactory from './appointment'

class ActionPlanAppointmentFactory extends Factory<ActionPlanAppointment> {
  newlyCreated() {
    return this.params({ ...appointmentFactory.newlyCreated().build() })
  }

  scheduled() {
    return this.params({
      ...appointmentFactory.scheduled().build(),
    })
  }

  attended(attendance: Attended) {
    return this.params({
      ...appointmentFactory.attended(attendance).build(),
    })
  }
}

export default ActionPlanAppointmentFactory.define(() => ({
  ...appointmentFactory.build(),
  sessionNumber: 1,
}))

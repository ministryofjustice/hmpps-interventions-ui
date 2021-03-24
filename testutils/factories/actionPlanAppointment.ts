import { Factory } from 'fishery'
import { ActionPlanAppointment } from '../../server/services/interventionsService'

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
}

export default ActionPlanAppointmentFactory.define(() => ({
  sessionNumber: 1,
  appointmentTime: null,
  durationInMinutes: null,
}))

import { Factory } from 'fishery'
import { ActionPlanAppointment } from '../../server/models/appointment'
import { Attended } from '../../server/models/appointmentAttendance'
import initialAssessmentAppointmentFactory from './initialAssessmentAppointment'

class ActionPlanAppointmentFactory extends Factory<ActionPlanAppointment> {
  newlyCreated() {
    return this
  }

  scheduled() {
    return this.params({
      ...initialAssessmentAppointmentFactory.newlyBooked().build(),
    })
  }

  attended(attendance: Attended) {
    return this.params({
      sessionFeedback: initialAssessmentAppointmentFactory.attended(attendance).build().sessionFeedback,
    })
  }
}

export default ActionPlanAppointmentFactory.define(() => ({
  sessionNumber: 1,
  appointmentTime: null,
  durationInMinutes: null,
  appointmentDeliveryType: null,
  appointmentDeliveryAddress: null,
  sessionFeedback: initialAssessmentAppointmentFactory.newlyBooked().build().sessionFeedback,
}))

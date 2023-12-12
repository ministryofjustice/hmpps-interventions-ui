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

  attended(attendance: Attended, didSessionHappen = true) {
    return this.params({
      appointmentFeedback: initialAssessmentAppointmentFactory.attended(attendance, didSessionHappen).build()
        .appointmentFeedback,
    })
  }
}

export default ActionPlanAppointmentFactory.define(() => ({
  sessionNumber: 1,
  appointmentTime: null,
  durationInMinutes: null,
  sessionType: null,
  appointmentDeliveryType: null,
  appointmentDeliveryAddress: null,
  appointmentFeedback: initialAssessmentAppointmentFactory.newlyBooked().build().appointmentFeedback,
  npsOfficeCode: null,
  appointmentId: '1',
}))

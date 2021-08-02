import { Factory } from 'fishery'
import { InitialAssessmentAppointment } from '../../server/models/appointment'
import SupplierAssessment from '../../server/models/supplierAssessment'
import initialAssessmentAppointmentFactory from './initialAssessmentAppointment'

class SupplierAssessmentFactory extends Factory<SupplierAssessment> {
  get justCreated() {
    return this
  }

  get withSingleAppointment() {
    const appointment = initialAssessmentAppointmentFactory.build()
    return this.params({ appointments: [appointment], currentAppointmentId: appointment.id })
  }

  withAnAppointment(appointment: InitialAssessmentAppointment) {
    return this.params({ appointments: [appointment], currentAppointmentId: appointment.id })
  }

  get withAttendedAppointment() {
    const appointment = initialAssessmentAppointmentFactory.attended('yes').build()
    return this.params({ appointments: [appointment], currentAppointmentId: appointment.id })
  }

  get withNonAttendedAppointment() {
    const appointment = initialAssessmentAppointmentFactory.attended('no').build()
    return this.params({ appointments: [appointment], currentAppointmentId: appointment.id })
  }
}

export default SupplierAssessmentFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  appointments: [],
  currentAppointmentId: null,
}))

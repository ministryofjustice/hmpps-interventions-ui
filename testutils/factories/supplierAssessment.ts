import { Factory } from 'fishery'
import SupplierAssessment from '../../server/models/supplierAssessment'
import appointmentFactory from './appointment'

class SupplierAssessmentFactory extends Factory<SupplierAssessment> {
  get justCreated() {
    return this
  }

  get withSingleAppointment() {
    const appointment = appointmentFactory.build()
    return this.params({ appointments: [appointment], currentAppointmentId: appointment.id })
  }

  get withAttendedAppointment() {
    const appointment = appointmentFactory.attended('yes').build()
    return this.params({ appointments: [appointment], currentAppointmentId: appointment.id })
  }

  get withNonAttendedAppointment() {
    const appointment = appointmentFactory.attended('no').build()
    return this.params({ appointments: [appointment], currentAppointmentId: appointment.id })
  }
}

export default SupplierAssessmentFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  appointments: [],
  currentAppointmentId: null,
}))

import Appointment from '../models/appointment'
import SupplierAssessment from '../models/supplierAssessment'

export default class SupplierAssessmentDecorator {
  constructor(private readonly supplierAssessment: SupplierAssessment) {}

  get currentAppointment(): Appointment | null {
    if (this.supplierAssessment.currentAppointmentId === null) {
      return null
    }
    const currentAppointment = this.supplierAssessment.appointments.find(
      appointment => appointment.id === this.supplierAssessment.currentAppointmentId
    )

    if (currentAppointment === undefined) {
      throw new Error(`Could not find appointment with ID ${this.supplierAssessment.currentAppointmentId}`)
    }

    return currentAppointment
  }
}

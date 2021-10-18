import { InitialAssessmentAppointment } from '../models/appointment'
import SupplierAssessment from '../models/supplierAssessment'
import DateUtils from '../utils/dateUtils'

export default class SupplierAssessmentDecorator {
  constructor(private readonly supplierAssessment: SupplierAssessment) {}

  get currentAppointment(): InitialAssessmentAppointment | null {
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

  get sortedAppointments(): InitialAssessmentAppointment[] {
    return this.supplierAssessment.appointments.sort((appointmentA, appointmentB) => {
      if (appointmentA.appointmentTime === null) {
        return -1
      }

      if (appointmentB.appointmentTime === null) {
        return 1
      }

      if (new Date(appointmentA.appointmentTime).getTime() < new Date(appointmentB.appointmentTime).getTime()) {
        return 1
      }
      if (new Date(appointmentA.appointmentTime).getTime() > new Date(appointmentB.appointmentTime).getTime()) {
        return -1
      }

      return 0
    })
  }

  appointmentDateAndTime(appointment: InitialAssessmentAppointment | null): string {
    if (appointment === null || appointment.appointmentTime === null) {
      return 'N/A'
    }

    return DateUtils.formattedDateTime(appointment.appointmentTime, { month: 'short', timeCasing: 'capitalized' })
  }
}

import Appointment from './appointment'

export default interface SupplierAssessment {
  id: string
  appointments: Appointment[]
  currentAppointmentId: string | null
}

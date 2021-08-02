import { InitialAssessmentAppointment } from './appointment'

export default interface SupplierAssessment {
  id: string
  appointments: InitialAssessmentAppointment[]
  currentAppointmentId: string | null
}

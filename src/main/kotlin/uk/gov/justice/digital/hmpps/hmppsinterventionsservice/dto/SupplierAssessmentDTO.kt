package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SupplierAssessment
import java.time.OffsetDateTime
import java.util.UUID

data class SupplierAssessmentDTO(
  val id: UUID,
  val appointmentTime: OffsetDateTime?,
  val durationInMinutes: Int?,
  val createdAt: OffsetDateTime,
  val createdBy: AuthUserDTO,
) {
  companion object {
    fun from(supplierAssessment: SupplierAssessment): SupplierAssessmentDTO {
      return SupplierAssessmentDTO(
        id = supplierAssessment.id,
        appointmentTime = supplierAssessment.appointment.appointmentTime,
        durationInMinutes = supplierAssessment.appointment.durationInMinutes,
        createdAt = supplierAssessment.appointment.createdAt,
        createdBy = AuthUserDTO.from(supplierAssessment.appointment.createdBy),
      )
    }
    fun from(supplierAssessment: List<SupplierAssessment>): List<SupplierAssessmentDTO> {
      return supplierAssessment.map { from(it) }
    }
  }
}

data class SupplierAssessmentAppointmentDTO(
  val id: UUID,
  val appointmentTime: OffsetDateTime?,
  val durationInMinutes: Int?,
) {
  companion object {
    fun from(appointment: Appointment): SupplierAssessmentAppointmentDTO {
      return SupplierAssessmentAppointmentDTO(
        id = appointment.id,
        appointmentTime = appointment.appointmentTime,
        durationInMinutes = appointment.durationInMinutes
      )
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SessionAttendance
import java.time.OffsetDateTime
import java.util.UUID

abstract class BaseAppointmentDTO(
  open val appointmentTime: OffsetDateTime?,
  open val durationInMinutes: Int?,
)

data class NewAppointmentDTO(
  val sessionNumber: Int,
  override val appointmentTime: OffsetDateTime?,
  override val durationInMinutes: Int?,
) : BaseAppointmentDTO(appointmentTime, durationInMinutes)

data class UpdateAppointmentDTO(
  override val appointmentTime: OffsetDateTime?,
  override val durationInMinutes: Int?,
) : BaseAppointmentDTO(appointmentTime, durationInMinutes)

data class UpdateAppointmentAttendanceDTO(
  val attended: SessionAttendance,
  val additionalAttendanceInformation: String?
)

data class ActionPlanAppointmentDTO(
  val id: UUID,
  val sessionNumber: Int,
  override val appointmentTime: OffsetDateTime?,
  override val durationInMinutes: Int?,
  val createdAt: OffsetDateTime,
  val createdBy: AuthUserDTO,
  val attendance: AttendanceDTO,
) : BaseAppointmentDTO(appointmentTime, durationInMinutes) {
  companion object {
    fun from(appointment: ActionPlanAppointment): ActionPlanAppointmentDTO {
      return ActionPlanAppointmentDTO(
        id = appointment.id,
        sessionNumber = appointment.sessionNumber,
        appointmentTime = appointment.appointmentTime,
        durationInMinutes = appointment.durationInMinutes,
        createdAt = appointment.createdAt,
        createdBy = AuthUserDTO.from(appointment.createdBy),
        attendance = AttendanceDTO.from(appointment.attended, appointment.additionalAttendanceInformation),
      )
    }
    fun from(appointments: List<ActionPlanAppointment>): List<ActionPlanAppointmentDTO> {
      return appointments.map { from(it) }
    }
  }
}

data class AttendanceDTO(
  val attended: SessionAttendance?,
  val additionalAttendanceInformation: String?
) {
  companion object {
    fun from(attended: SessionAttendance?, additionalAttendanceInformation: String?): AttendanceDTO {
      return AttendanceDTO(
        attended = attended,
        additionalAttendanceInformation = additionalAttendanceInformation
      )
    }
  }
}

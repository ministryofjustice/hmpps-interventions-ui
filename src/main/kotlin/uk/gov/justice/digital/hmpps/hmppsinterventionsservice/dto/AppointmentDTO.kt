package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import java.time.OffsetDateTime
import java.util.UUID

data class AppointmentDTO(
  val id: UUID,
  val appointmentTime: OffsetDateTime?,
  val durationInMinutes: Int?,
  val sessionFeedback: SessionFeedbackDTO,
) {
  companion object {
    fun from(appointment: Appointment): AppointmentDTO {
      return AppointmentDTO(
        id = appointment.id,
        appointmentTime = appointment.appointmentTime,
        durationInMinutes = appointment.durationInMinutes,
        sessionFeedback = SessionFeedbackDTO.from(
          appointment.attended,
          appointment.additionalAttendanceInformation,
          appointment.attendanceBehaviour,
          appointment.notifyPPOfAttendanceBehaviour,
          appointment.appointmentFeedbackSubmittedAt != null,
        ),
      )
    }
    fun from(appointments: MutableSet<Appointment>): List<AppointmentDTO> {
      return appointments.map { from(it) }
    }
  }
}

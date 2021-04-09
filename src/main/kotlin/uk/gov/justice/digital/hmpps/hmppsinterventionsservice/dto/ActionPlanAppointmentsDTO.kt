package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
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
  val attended: Attended,
  val additionalAttendanceInformation: String?
)

data class UpdateAppointmentBehaviourDTO(
  val behaviourDescription: String,
  val notifyProbationPractitioner: Boolean,
)

data class ActionPlanAppointmentDTO(
  val id: UUID,
  val sessionNumber: Int,
  override val appointmentTime: OffsetDateTime?,
  override val durationInMinutes: Int?,
  val createdAt: OffsetDateTime,
  val createdBy: AuthUserDTO,
  val sessionFeedback: SessionFeedbackDTO,
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
        sessionFeedback = SessionFeedbackDTO.from(
          appointment.attended,
          appointment.additionalAttendanceInformation,
          appointment.attendanceBehaviour,
          appointment.notifyPPOfAttendanceBehaviour,
          appointment.attendanceSubmittedAt != null,
        ),
      )
    }
    fun from(appointments: List<ActionPlanAppointment>): List<ActionPlanAppointmentDTO> {
      return appointments.map { from(it) }
    }
  }
}

data class SessionFeedbackDTO(
  val attendance: AttendanceDTO,
  val behaviour: BehaviourDTO,
  val submitted: Boolean,
) {
  companion object {
    fun from(
      attended: Attended?,
      additionalAttendanceInformation: String?,
      behaviourDescription: String?,
      notifyProbationPractitioner: Boolean?,
      submitted: Boolean,
    ): SessionFeedbackDTO {
      return SessionFeedbackDTO(
        AttendanceDTO(attended = attended, additionalAttendanceInformation = additionalAttendanceInformation),
        BehaviourDTO(behaviourDescription, notifyProbationPractitioner),
        submitted,
      )
    }
  }
}

data class AttendanceDTO(
  val attended: Attended?,
  val additionalAttendanceInformation: String?,
)

data class BehaviourDTO(
  val behaviourDescription: String?,
  val notifyProbationPractitioner: Boolean?,
)

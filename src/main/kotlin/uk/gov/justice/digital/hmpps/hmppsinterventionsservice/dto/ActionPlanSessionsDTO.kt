package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import java.time.OffsetDateTime
import java.util.UUID

abstract class BaseAppointmentDTO(
  open val appointmentTime: OffsetDateTime?,
  open val durationInMinutes: Int?,
)

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

data class ActionPlanSessionDTO(
  val id: UUID,
  val sessionNumber: Int,
  override val appointmentTime: OffsetDateTime?,
  override val durationInMinutes: Int?,
  val createdAt: OffsetDateTime,
  val createdBy: AuthUserDTO,
  val sessionFeedback: SessionFeedbackDTO,
) : BaseAppointmentDTO(appointmentTime, durationInMinutes) {
  companion object {
    fun from(session: ActionPlanSession): ActionPlanSessionDTO {
      return ActionPlanSessionDTO(
        id = session.id,
        sessionNumber = session.sessionNumber,
        appointmentTime = session.appointmentTime,
        durationInMinutes = session.durationInMinutes,
        createdAt = session.createdAt,
        createdBy = AuthUserDTO.from(session.createdBy),
        sessionFeedback = SessionFeedbackDTO.from(
          session.attended,
          session.additionalAttendanceInformation,
          session.attendanceBehaviour,
          session.notifyPPOfAttendanceBehaviour,
          session.attendanceSubmittedAt != null,
        ),
      )
    }
    fun from(sessions: List<ActionPlanSession>): List<ActionPlanSessionDTO> {
      return sessions.map { from(it) }
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

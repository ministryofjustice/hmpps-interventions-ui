package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import java.time.OffsetDateTime
import java.util.UUID

data class UpdateAppointmentDTO(
  val appointmentTime: OffsetDateTime,
  val durationInMinutes: Int,
)

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
  val appointmentTime: OffsetDateTime?,
  val durationInMinutes: Int?,
  val sessionFeedback: SessionFeedbackDTO,
) {
  companion object {
    fun from(session: ActionPlanSession): ActionPlanSessionDTO {
      return ActionPlanSessionDTO(
        id = session.id,
        sessionNumber = session.sessionNumber,
        appointmentTime = session.currentAppointment?.appointmentTime,
        durationInMinutes = session.currentAppointment?.durationInMinutes,
        sessionFeedback = SessionFeedbackDTO.from(
          session.currentAppointment?.attended,
          session.currentAppointment?.additionalAttendanceInformation,
          session.currentAppointment?.attendanceBehaviour,
          session.currentAppointment?.notifyPPOfAttendanceBehaviour,
          session.currentAppointment?.attendanceSubmittedAt != null,
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

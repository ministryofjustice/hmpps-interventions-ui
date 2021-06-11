package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import com.fasterxml.jackson.annotation.JsonProperty
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import java.time.OffsetDateTime
import java.util.UUID

data class UpdateAppointmentDTO(
  val appointmentTime: OffsetDateTime,
  // TODO: remove optional when front-end changes are complete
  val appointmentDeliveryType: AppointmentDeliveryType? = null,
  val appointmentDeliveryAddress: List<String>? = null,
  @JsonProperty(required = true) val durationInMinutes: Int,
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
  val appointmentDeliveryType: AppointmentDeliveryType?,
  val appointmentDeliveryAddress: List<String>?,
  val sessionFeedback: SessionFeedbackDTO,
) {
  companion object {
    fun from(session: ActionPlanSession): ActionPlanSessionDTO {
      val appointmentDelivery = session.currentAppointment?.appointmentDelivery
      val address = when (appointmentDelivery?.appointmentDeliveryType) {
        AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE -> listOfNotNull(appointmentDelivery?.npsOfficeCode)
        AppointmentDeliveryType.IN_PERSON_MEETING_OTHER -> {
          if (appointmentDelivery?.appointmentDeliveryAddress !== null) {
            val address = appointmentDelivery.appointmentDeliveryAddress
            if (address != null) {

              listOfNotNull(address.firstAddressLine, address.secondAddressLine ?: "", address.townCity, address.county, address.postCode)
            } else null
          } else null
        }
        else -> null
      }
      return ActionPlanSessionDTO(
        id = session.id,
        sessionNumber = session.sessionNumber,
        appointmentTime = session.currentAppointment?.appointmentTime,
        durationInMinutes = session.currentAppointment?.durationInMinutes,
        appointmentDeliveryType = session.currentAppointment?.appointmentDelivery?.appointmentDeliveryType,
        appointmentDeliveryAddress = address,
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

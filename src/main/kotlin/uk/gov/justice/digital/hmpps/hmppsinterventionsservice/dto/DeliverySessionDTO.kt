package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DeliverySession
import java.time.OffsetDateTime
import java.util.UUID

data class AddressDTO private constructor(
  val firstAddressLine: String,
  val secondAddressLine: String? = null,
  val townOrCity: String? = null,
  val county: String? = null,
  val postCode: String,
) {
  companion object {
    @JvmStatic
    @JsonCreator
    operator fun invoke(firstAddressLine: String, secondAddressLine: String? = null, townOrCity: String? = null, county: String? = null, postCode: String): AddressDTO {
      val normalizedPostCode = postCode.replace("\\s".toRegex(), "").uppercase()
      return AddressDTO(firstAddressLine, secondAddressLine, townOrCity, county, normalizedPostCode)
    }
  }
}

data class UpdateAppointmentDTO(
  val appointmentTime: OffsetDateTime,
  @JsonProperty(required = true) val durationInMinutes: Int,
  val appointmentDeliveryType: AppointmentDeliveryType,
  val sessionType: AppointmentSessionType? = null,
  val appointmentDeliveryAddress: AddressDTO? = null,
  val npsOfficeCode: String? = null,
  val appointmentAttendance: UpdateAppointmentAttendanceDTO? = null,
  val appointmentBehaviour: RecordAppointmentBehaviourDTO? = null,
)

data class DeliverySessionAppointmentScheduleDetailsDTO(
  val sessionId: Int,
  val appointmentTime: OffsetDateTime,
  @JsonProperty(required = true) val durationInMinutes: Int,
  val appointmentDeliveryType: AppointmentDeliveryType,
  val sessionType: AppointmentSessionType,
  val appointmentDeliveryAddress: AddressDTO? = null,
  val npsOfficeCode: String? = null,
)

data class UpdateAppointmentAttendanceDTO(
  val attended: Attended,
  val additionalAttendanceInformation: String?
)

data class RecordAppointmentBehaviourDTO(
  val behaviourDescription: String,
  val notifyProbationPractitioner: Boolean,
)

data class DeliverySessionDTO(
  val id: UUID,
  val sessionNumber: Int,
  val appointmentTime: OffsetDateTime?,
  val durationInMinutes: Int?,
  val appointmentDeliveryType: AppointmentDeliveryType?,
  val sessionType: AppointmentSessionType?,
  val npsOfficeCode: String?,
  val appointmentDeliveryAddress: AddressDTO?,
  val sessionFeedback: SessionFeedbackDTO,
) {
  companion object {
    fun from(session: DeliverySession): DeliverySessionDTO {
      val appointmentDelivery = session.currentAppointment?.appointmentDelivery
      val address = when (appointmentDelivery?.appointmentDeliveryType) {
        AppointmentDeliveryType.IN_PERSON_MEETING_OTHER -> {
          if (appointmentDelivery?.appointmentDeliveryAddress !== null) {
            val address = appointmentDelivery.appointmentDeliveryAddress
            if (address != null) {
              AddressDTO(address.firstAddressLine, address.secondAddressLine ?: "", address.townCity, address.county, address.postCode)
            } else null
          } else null
        }
        else -> null
      }

      return DeliverySessionDTO(
        id = session.id,
        sessionNumber = session.sessionNumber,
        appointmentTime = session.currentAppointment?.appointmentTime,
        durationInMinutes = session.currentAppointment?.durationInMinutes,
        appointmentDeliveryType = session.currentAppointment?.appointmentDelivery?.appointmentDeliveryType,
        sessionType = session.currentAppointment?.appointmentDelivery?.appointmentSessionType,
        appointmentDeliveryAddress = address,
        npsOfficeCode = session.currentAppointment?.appointmentDelivery?.npsOfficeCode,
        sessionFeedback = SessionFeedbackDTO.from(
          session.currentAppointment?.attended,
          session.currentAppointment?.additionalAttendanceInformation,
          session.currentAppointment?.attendanceBehaviour,
          session.currentAppointment?.notifyPPOfAttendanceBehaviour,
          session.currentAppointment?.appointmentFeedbackSubmittedAt != null,
          session.currentAppointment?.appointmentFeedbackSubmittedBy,
        ),
      )
    }
    fun from(sessions: List<DeliverySession>): List<DeliverySessionDTO> {
      return sessions.map { from(it) }
    }
  }
}

data class SessionFeedbackDTO(
  val attendance: AttendanceDTO,
  val behaviour: BehaviourDTO,
  val submitted: Boolean,
  val submittedBy: AuthUserDTO?,
) {
  companion object {
    fun from(
      attended: Attended?,
      additionalAttendanceInformation: String?,
      behaviourDescription: String?,
      notifyProbationPractitioner: Boolean?,
      submitted: Boolean,
      submittedBy: AuthUser?,
    ): SessionFeedbackDTO {
      return SessionFeedbackDTO(
        AttendanceDTO(attended = attended, additionalAttendanceInformation = additionalAttendanceInformation),
        BehaviourDTO(behaviourDescription, notifyProbationPractitioner),
        submitted,
        submittedBy?.let { AuthUserDTO.from(it) },
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

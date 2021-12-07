package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import java.time.OffsetDateTime
import java.util.UUID

data class DeliverySessionAppointmentDTO(
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
    fun from(sessionNumber: Int, appointment: Appointment): DeliverySessionAppointmentDTO {
      val appointmentDelivery = appointment.appointmentDelivery
      val address = when (appointmentDelivery?.appointmentDeliveryType) {
        AppointmentDeliveryType.IN_PERSON_MEETING_OTHER -> {
          appointmentDelivery?.appointmentDeliveryAddress?.let {
            appointmentDelivery.appointmentDeliveryAddress?.let { address ->
              AddressDTO(address.firstAddressLine, address.secondAddressLine ?: "", address.townCity, address.county, address.postCode)
            }
          }
        }
        else -> null
      }

      return DeliverySessionAppointmentDTO(
        id = appointment.id,
        sessionNumber = sessionNumber,
        appointmentTime = appointment.appointmentTime,
        durationInMinutes = appointment.durationInMinutes,
        appointmentDeliveryType = appointment.appointmentDelivery?.appointmentDeliveryType,
        sessionType = appointment.appointmentDelivery?.appointmentSessionType,
        appointmentDeliveryAddress = address,
        npsOfficeCode = appointment.appointmentDelivery?.npsOfficeCode,
        sessionFeedback = SessionFeedbackDTO.from(
          appointment.attended,
          appointment.additionalAttendanceInformation,
          appointment.attendanceBehaviour,
          appointment.notifyPPOfAttendanceBehaviour,
          appointment.appointmentFeedbackSubmittedAt != null,
          appointment.appointmentFeedbackSubmittedBy,
        ),
      )
    }
  }
}

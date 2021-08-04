package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import java.time.OffsetDateTime
import java.util.UUID

data class AppointmentDTO(
  val id: UUID,
  val appointmentTime: OffsetDateTime?,
  val durationInMinutes: Int?,
  val sessionFeedback: SessionFeedbackDTO,
  val appointmentDeliveryType: AppointmentDeliveryType?,
  val sessionType: AppointmentSessionType?,
  val appointmentDeliveryAddress: AddressDTO?,
  val npsOfficeCode: String?
) {
  companion object {
    fun from(appointment: Appointment): AppointmentDTO {
      var addressDTO: AddressDTO? = null
      if (appointment.appointmentDelivery?.appointmentDeliveryType == AppointmentDeliveryType.IN_PERSON_MEETING_OTHER) {
        val address = appointment.appointmentDelivery?.appointmentDeliveryAddress
        if (address != null) {
          addressDTO = AddressDTO(address.firstAddressLine, address.secondAddressLine, address.townCity, address.county, address.postCode)
        }
      }
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
          appointment.appointmentFeedbackSubmittedBy,
        ),
        appointmentDeliveryType = appointment.appointmentDelivery?.appointmentDeliveryType,
        sessionType = appointment.appointmentDelivery?.appointmentSessionType,
        appointmentDeliveryAddress = addressDTO,
        npsOfficeCode = appointment.appointmentDelivery?.npsOfficeCode
      )
    }
    fun from(appointments: MutableSet<Appointment>): List<AppointmentDTO> {
      return appointments.map { from(it) }
    }
  }
}

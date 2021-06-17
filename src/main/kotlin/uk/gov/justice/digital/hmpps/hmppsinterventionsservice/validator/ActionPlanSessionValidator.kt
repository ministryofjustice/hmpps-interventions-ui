package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType

@Component
class ActionPlanSessionValidator {

  fun validateUpdateAppointment(updateAppointmentDTO: UpdateAppointmentDTO) {
    val errors = mutableListOf<FieldError>()
    val appointmentDeliveryAddressLines = updateAppointmentDTO.appointmentDeliveryAddress
    when (updateAppointmentDTO.appointmentDeliveryType) {
      AppointmentDeliveryType.VIDEO_CALL -> {
        if (appointmentDeliveryAddressLines == null || appointmentDeliveryAddressLines.isEmpty()) {
          errors.add(FieldError(field = "appointmentDeliveryAddress", error = Code.CANNOT_BE_EMPTY))
        }
      }
      AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE -> {
        if (appointmentDeliveryAddressLines == null || appointmentDeliveryAddressLines.isEmpty()) {
          errors.add(FieldError(field = "appointmentDeliveryAddress", error = Code.CANNOT_BE_EMPTY))
        } else if (appointmentDeliveryAddressLines.first().length > 7) {
          errors.add(FieldError(field = "appointmentDeliveryAddress", error = Code.INVALID_VALUE))
        }
      }
      AppointmentDeliveryType.IN_PERSON_MEETING_OTHER -> {
        if (appointmentDeliveryAddressLines == null || appointmentDeliveryAddressLines.isEmpty()) {
          errors.add(FieldError(field = "appointmentDeliveryAddress", error = Code.CANNOT_BE_EMPTY))
        } else if (appointmentDeliveryAddressLines.size !== 5) {
          errors.add(FieldError(field = "appointmentDeliveryAddress", error = Code.INVALID_LENGTH))
        } else if (appointmentDeliveryAddressLines.elementAt(4).length > 8) {
          errors.add(FieldError(field = "appointmentDeliveryAddress", error = Code.INVALID_FORMAT))
        }
      }
    }

    if (errors.isNotEmpty()) {
      throw ValidationError("invalid update session appointment request", errors)
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.NO
import java.time.OffsetDateTime

@Component
class AppointmentValidator {
  companion object {
    val postCodeRegex = Regex("""^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}${'$'}""")
  }
  fun validateUpdateAppointment(updateAppointmentDTO: UpdateAppointmentDTO) {
    val errors = mutableListOf<FieldError>()
    val appointmentDeliveryAddress = updateAppointmentDTO.appointmentDeliveryAddress
    when (updateAppointmentDTO.appointmentDeliveryType) {
      AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE -> {
        if (updateAppointmentDTO.npsOfficeCode.isNullOrEmpty()) {
          errors.add(FieldError(field = "npsOfficeCode", error = Code.CANNOT_BE_EMPTY))
        }
      }
      AppointmentDeliveryType.IN_PERSON_MEETING_OTHER -> {
        if (appointmentDeliveryAddress == null) {
          errors.add(FieldError(field = "appointmentDeliveryAddress", error = Code.CANNOT_BE_EMPTY))
        } else {
          validateAddress(appointmentDeliveryAddress, errors)
        }
      }
    }
    validateAttendanceAndBehaviourFieldsIfHistoricAppointment(
      updateAppointmentDTO.appointmentTime,
      updateAppointmentDTO.appointmentAttendance?.attended,
      updateAppointmentDTO.appointmentBehaviour?.notifyProbationPractitioner,
      updateAppointmentDTO.appointmentBehaviour?.behaviourDescription,
      errors
    )
    if (errors.isNotEmpty()) {
      throw ValidationError("invalid update session appointment request", errors)
    }
  }

  private fun validateAddress(addressDTO: AddressDTO, errors: MutableList<FieldError>) {
    if (addressDTO.firstAddressLine.isNullOrEmpty()) {
      errors.add(FieldError(field = "appointmentDeliveryAddress.firstAddressLine", error = Code.CANNOT_BE_EMPTY))
    }
    if (addressDTO.postCode.isNullOrEmpty()) {
      errors.add(FieldError(field = "appointmentDeliveryAddress.postCode", error = Code.CANNOT_BE_EMPTY))
    } else if (!postCodeRegex.matches(addressDTO.postCode)) {
      errors.add(FieldError(field = "appointmentDeliveryAddress.postCode", error = Code.INVALID_FORMAT))
    }
  }

  private fun validateAttendanceAndBehaviourFieldsIfHistoricAppointment(
    appointmentTime: OffsetDateTime,
    attended: Attended?,
    notifyProbationPractitioner: Boolean?,
    behaviourDescription: String?,
    errors: MutableList<FieldError>
  ) {
    if (appointmentTime.isAfter(OffsetDateTime.now()))
      return

    when (attended) {
      null, NO -> {
        checkValueNotSupplied(notifyProbationPractitioner, "appointmentBehaviour.notifyProbationPractitioner", Code.INVALID_VALUE, errors)
        checkValueNotSupplied(behaviourDescription, "appointmentBehaviour.behaviourDescription", Code.INVALID_VALUE, errors)
      }
      else -> { // YES OR LATE
        checkValueSupplied(notifyProbationPractitioner, "appointmentBehaviour.notifyProbationPractitioner", Code.CANNOT_BE_EMPTY, errors)
        checkValueSupplied(behaviourDescription, "appointmentBehaviour.behaviourDescription", Code.CANNOT_BE_EMPTY, errors)
      }
    }
  }

  fun <T : Any> checkValueSupplied(field: T?, fieldName: String, errorCode: Code, errors: MutableList<FieldError>) {
    field ?: errors.add(FieldError(field = fieldName, error = errorCode))
  }

  fun <T : Any> checkValueNotSupplied(field: T?, fieldName: String, errorCode: Code, errors: MutableList<FieldError>) {
    field?.let { errors.add(FieldError(field = fieldName, error = errorCode)) }
  }
}

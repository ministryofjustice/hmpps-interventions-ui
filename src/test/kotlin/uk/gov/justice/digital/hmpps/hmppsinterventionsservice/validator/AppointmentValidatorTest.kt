package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import java.time.OffsetDateTime

internal class AppointmentValidatorTest {

  private val deliverySessionValidator = AppointmentValidator()

  @Nested
  inner class ValidateUpdateAppointment {

    @Nested
    inner class DeliusOfficeLocationAppointment {
      @Test
      fun `can request valid a delius office appointment`() {
        val updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now().plusDays(1), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE, sessionType = AppointmentSessionType.ONE_TO_ONE, npsOfficeCode = "CRSEXT")
        assertDoesNotThrow {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }
      }
      @Test
      fun `an empty delius office location throws validation error`() {
        var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now().plusDays(1), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE, sessionType = AppointmentSessionType.ONE_TO_ONE)
        var exception = assertThrows<ValidationError> {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }
        assertThat(exception.errors).containsExactly(
          FieldError("npsOfficeCode", Code.CANNOT_BE_EMPTY),
        )
      }
    }

    @Nested
    inner class OtherLocationAppointment {
      @Test
      fun `can request valid non nps office appointment`() {
        val updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now().plusHours(1), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, sessionType = AppointmentSessionType.ONE_TO_ONE, appointmentDeliveryAddress = AddressDTO("firstline", "secondLine", "town", "county", "A1 1AA"))
        assertDoesNotThrow {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }
      }

      @Test
      fun `can request valid non nps office appointment with null values for optional fields`() {
        val updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now().plusHours(1), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, sessionType = AppointmentSessionType.ONE_TO_ONE, appointmentDeliveryAddress = AddressDTO("firstline", null, null, null, "A1 1AA"))
        assertDoesNotThrow {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }
      }

      @Nested
      inner class PostCodeValidation {

        private fun createUpdateAppointmentDTO(postCode: String): UpdateAppointmentDTO {
          return UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now().plusHours(1), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, sessionType = AppointmentSessionType.ONE_TO_ONE, appointmentDeliveryAddress = AddressDTO("firstline", "secondLine", "town", "county", postCode))
        }
        @Test
        fun `can request valid non nps office appointment for various postcodes`() {
          assertDoesNotThrow {
            deliverySessionValidator.validateUpdateAppointment(createUpdateAppointmentDTO("aa9a 9aa"))
            deliverySessionValidator.validateUpdateAppointment(createUpdateAppointmentDTO("a9a 9aa"))
            deliverySessionValidator.validateUpdateAppointment(createUpdateAppointmentDTO("a9 9aa"))
            deliverySessionValidator.validateUpdateAppointment(createUpdateAppointmentDTO("a99 9aa"))
            deliverySessionValidator.validateUpdateAppointment(createUpdateAppointmentDTO("aa9 9aa"))
            deliverySessionValidator.validateUpdateAppointment(createUpdateAppointmentDTO("aa99 9aa"))
          }
        }

        @Test
        fun `invalid postcode for non nps office appointment throws validation error`() {
          var exception = assertThrows<ValidationError> {
            deliverySessionValidator.validateUpdateAppointment(createUpdateAppointmentDTO("aaa9 9aa"))
          }
          assertThat(exception.errors).containsExactly(
            FieldError("appointmentDeliveryAddress.postCode", Code.INVALID_FORMAT),
          )
        }
      }

      @Test
      fun `empty address for non nps office appointment throws validation error`() {
        var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now().plusHours(1), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, sessionType = AppointmentSessionType.ONE_TO_ONE, appointmentDeliveryAddress = null)
        var exception = assertThrows<ValidationError> {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }

        assertThat(exception.errors).containsExactly(
          FieldError("appointmentDeliveryAddress", Code.CANNOT_BE_EMPTY),
        )
      }

      @Test
      fun `empty address fields for non nps office appointment throws validation error`() {
        var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now().plusHours(1), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, sessionType = AppointmentSessionType.ONE_TO_ONE, appointmentDeliveryAddress = AddressDTO("", "", "", "", ""))
        var exception = assertThrows<ValidationError> {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }
        assertThat(exception.errors).containsExactly(
          FieldError("appointmentDeliveryAddress.firstAddressLine", Code.CANNOT_BE_EMPTY),
          FieldError("appointmentDeliveryAddress.postCode", Code.CANNOT_BE_EMPTY),
        )
      }

      @Test
      fun `past appointment fails if no attendance reported`() {
        val updateAppointmentDTO = UpdateAppointmentDTO(
          appointmentTime = OffsetDateTime.now().minusDays(1),
          durationInMinutes = 1,
          appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE,
          sessionType = AppointmentSessionType.ONE_TO_ONE,
          npsOfficeCode = "CRSEXT",
          appointmentAttendance = null,
          appointmentBehaviour = null
        )
        val exception = assertThrows<ValidationError> {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }
        assertThat(exception.errors).containsExactly(
          FieldError("appointmentAttendance.attended", Code.CANNOT_BE_EMPTY),
        )
      }

      @Test
      fun `past appointment fails if attendance reported as yes but behaviour is not`() {
        val updateAppointmentDTO = UpdateAppointmentDTO(
          appointmentTime = OffsetDateTime.now().minusDays(1),
          durationInMinutes = 1,
          appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE,
          sessionType = AppointmentSessionType.ONE_TO_ONE,
          npsOfficeCode = "CRSEXT",
          appointmentAttendance = UpdateAppointmentAttendanceDTO(Attended.YES, null),
          appointmentBehaviour = null
        )
        val exception = assertThrows<ValidationError> {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }
        assertThat(exception.errors).containsExactly(
          FieldError("appointmentBehaviour.notifyProbationPractitioner", Code.CANNOT_BE_EMPTY),
          FieldError("appointmentBehaviour.behaviourDescription", Code.CANNOT_BE_EMPTY),
        )
      }

      @Test
      fun `past appointment fails if attendance reported as late but behaviour is not`() {
        val updateAppointmentDTO = UpdateAppointmentDTO(
          appointmentTime = OffsetDateTime.now().minusDays(1),
          durationInMinutes = 1,
          appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE,
          sessionType = AppointmentSessionType.ONE_TO_ONE,
          npsOfficeCode = "CRSEXT",
          appointmentAttendance = UpdateAppointmentAttendanceDTO(Attended.LATE, null),
          appointmentBehaviour = null
        )
        val exception = assertThrows<ValidationError> {
          deliverySessionValidator.validateUpdateAppointment(updateAppointmentDTO)
        }
        assertThat(exception.errors).containsExactly(
          FieldError("appointmentBehaviour.notifyProbationPractitioner", Code.CANNOT_BE_EMPTY),
          FieldError("appointmentBehaviour.behaviourDescription", Code.CANNOT_BE_EMPTY),
        )
      }
    }
  }
}

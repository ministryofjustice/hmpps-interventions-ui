package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import java.time.OffsetDateTime

internal class ActionPlanSessionValidatorTest {

  private val actionPlanSessionValidator = ActionPlanSessionValidator()

  @Nested
  inner class ValidateUpdateAppointment {
    @Test
    fun `can request valid nps office appointment`() {
      val updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE, appointmentDeliveryAddress = listOf("ABC"))
      assertDoesNotThrow {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
    }

    @Test
    fun `empty nps code for nps office appointment throws validation error`() {
      var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE, appointmentDeliveryAddress = null)
      var exception = assertThrows<ValidationError> {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
      assertThat(exception.errors.first().error).isEqualTo(Code.CANNOT_BE_EMPTY)
      updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE, appointmentDeliveryAddress = listOf())
      exception = assertThrows {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
      assertThat(exception.errors.first().error).isEqualTo(Code.CANNOT_BE_EMPTY)
    }

    @Test
    fun `invalid nps code for nps office appointment throws validation error`() {
      var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE, appointmentDeliveryAddress = listOf("CODE THAT IS TOO LONG"))
      var exception = assertThrows<ValidationError> {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
      assertThat(exception.errors.first().error).isEqualTo(Code.INVALID_VALUE)
    }

    @Test
    fun `can request valid non nps office appointment`() {
      val updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, appointmentDeliveryAddress = listOf("firstline", "secondLine", "town", "county", "A1 1AA"))
      assertDoesNotThrow {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
    }

    @Test
    fun `empty address for non nps office appointment throws validation error`() {
      var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, appointmentDeliveryAddress = null)
      var exception = assertThrows<ValidationError> {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
      assertThat(exception.errors.first().error).isEqualTo(Code.CANNOT_BE_EMPTY)
      updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, appointmentDeliveryAddress = listOf())
      exception = assertThrows {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
      assertThat(exception.errors.first().error).isEqualTo(Code.CANNOT_BE_EMPTY)
    }

    @Test
    fun `too few address fields for non nps office appointment throws validation error`() {
      var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, appointmentDeliveryAddress = listOf("firstline", "town", "county", "A1 1AA"))
      var exception = assertThrows<ValidationError> {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
      assertThat(exception.errors.first().error).isEqualTo(Code.INVALID_LENGTH)
    }

    @Test
    fun `too many address fields for non nps office appointment throws validation error`() {
      var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, appointmentDeliveryAddress = listOf("firstline", "secondLine", "thirdLine", "town", "county", "A1 1AA"))
      var exception = assertThrows<ValidationError> {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
      assertThat(exception.errors.first().error).isEqualTo(Code.INVALID_LENGTH)
    }

    @Test
    fun `invalid postcode for non nps office appointment throws validation error`() {
      var updateAppointmentDTO = UpdateAppointmentDTO(appointmentTime = OffsetDateTime.now(), durationInMinutes = 1, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, appointmentDeliveryAddress = listOf("firstline", "secondLine", "town", "county", "AAA1 1AAA"))
      var exception = assertThrows<ValidationError> {
        actionPlanSessionValidator.validateUpdateAppointment(updateAppointmentDTO)
      }
      assertThat(exception.errors.first().error).isEqualTo(Code.INVALID_FORMAT)
    }
  }
}

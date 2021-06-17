package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import java.time.OffsetDateTime

class AppointmentServiceTest {
  private val authUserRepository: AuthUserRepository = mock()
  private val appointmentRepository: AppointmentRepository = mock()

  private val authUserFactory = AuthUserFactory()
  private val appointmentFactory = AppointmentFactory()

  private val appointmentService = AppointmentService(
    appointmentRepository,
    authUserRepository,
  )

  @Test
  fun `create new appointment if none currently exist`() {
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val createdByUser = authUserFactory.create()
    val appointment = appointmentFactory.create()

    whenever(appointmentRepository.save(any())).thenReturn(appointment)
    whenever(authUserRepository.save(any())).thenReturn(createdByUser)

    appointmentService.createOrUpdateAppointment(null, durationInMinutes, appointmentTime, createdByUser)

    val argumentCaptor = argumentCaptor<Appointment>()
    verify(appointmentRepository, times(1)).save(argumentCaptor.capture())
    val arguments = argumentCaptor.firstValue

    assertThat(arguments.appointmentTime).isEqualTo(appointmentTime)
    assertThat(arguments.durationInMinutes).isEqualTo(durationInMinutes)
  }

  @Test
  fun `appointment without attendance data can be updated`() {
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val createdByUser = authUserFactory.create()
    val appointment = appointmentFactory.create()

    whenever(appointmentRepository.save(any())).thenReturn(appointment)
    whenever(authUserRepository.save(any())).thenReturn(createdByUser)

    appointmentService.createOrUpdateAppointment(appointment, durationInMinutes, appointmentTime, createdByUser)

    val argumentCaptor = argumentCaptor<Appointment>()
    verify(appointmentRepository, times(1)).save(argumentCaptor.capture())
    val arguments = argumentCaptor.firstValue

    assertThat(arguments.id).isEqualTo(appointment.id)
    assertThat(arguments.appointmentTime).isEqualTo(appointmentTime)
    assertThat(arguments.durationInMinutes).isEqualTo(durationInMinutes)
  }

  @Test
  fun `appointment with none attendance will create a new appointment`() {
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val createdByUser = authUserFactory.create()
    val appointment = appointmentFactory.create(attended = Attended.NO)

    whenever(appointmentRepository.save(any())).thenReturn(appointment)
    whenever(authUserRepository.save(any())).thenReturn(createdByUser)

    appointmentService.createOrUpdateAppointment(appointment, durationInMinutes, appointmentTime, createdByUser)

    val argumentCaptor = argumentCaptor<Appointment>()
    verify(appointmentRepository, times(1)).save(argumentCaptor.capture())
    val arguments = argumentCaptor.firstValue

    assertThat(arguments.appointmentTime).isEqualTo(appointmentTime)
    assertThat(arguments.durationInMinutes).isEqualTo(durationInMinutes)
  }

  @Test
  fun `any other scenario will throw an error`() {
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val createdByUser = authUserFactory.create()
    val appointment = appointmentFactory.create(attended = Attended.YES)

    val error = assertThrows<IllegalStateException> {
      appointmentService.createOrUpdateAppointment(appointment, durationInMinutes, appointmentTime, createdByUser)
    }
    assertThat(error.message).contains("Is it not possible to update an appointment that has already been attended")
  }
}

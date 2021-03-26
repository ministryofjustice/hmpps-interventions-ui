package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.firstValue
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanAppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import java.time.OffsetDateTime
import java.util.Optional.of
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

internal class AppointmentsServiceTest {

  private val actionPlanRepository: ActionPlanRepository = mock()
  private val actionPlanAppointmentRepository: ActionPlanAppointmentRepository = mock()
  private val authUserRepository: AuthUserRepository = mock()

  private val appointmentsService = AppointmentsService(actionPlanAppointmentRepository, actionPlanRepository, authUserRepository)

  @Test
  fun `creates an appointment`() {
    val startTimeOfTest = OffsetDateTime.now()
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(null)
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(actionPlanRepository.findById(actionPlanId)).thenReturn(of(actionPlan))
    val savedAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)
    whenever(
      actionPlanAppointmentRepository.save(
        ArgumentMatchers.argThat { (
          sessionNumberArg,
          sessionAttendanceArg,
          additionalAttendanceInformationArg,
          attendanceSubmittedAtArg,
          appointmentTimeArg,
          durationInMinutesArg,
          createdByArg,
          createdAtArg,
          actionPlanArg,

          _
        ) ->
          (
            sessionNumberArg == sessionNumber &&
              sessionAttendanceArg == null &&
              additionalAttendanceInformationArg == null &&
              attendanceSubmittedAtArg == null &&
              appointmentTimeArg == appointmentTime &&
              durationInMinutesArg == durationInMinutes &&
              createdByArg == createdByUser &&
              createdAtArg.isAfter(startTimeOfTest) &&
              actionPlanArg == actionPlan
            )
        }
      )
    ).thenReturn(savedAppointment)

    val createdAppointment = appointmentsService.createAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      createdByUser
    )

    assertThat(createdAppointment).isEqualTo(savedAppointment)
  }

  @Test
  fun `creates an appointment and throws exception if already exists`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()

    val existingAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(existingAppointment)

    val exception = assertThrows(EntityExistsException::class.java) {
      appointmentsService.createAppointment(
        actionPlanId,
        sessionNumber,
        appointmentTime,
        durationInMinutes,
        createdByUser
      )
    }
    assertThat(exception.message).isEqualTo("Action plan appointment already exists for [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `updates an appointment`() {
    val startTimeOfTest = OffsetDateTime.now()
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(actionPlanAppointment)
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(
      actionPlanAppointmentRepository.save(
        ArgumentMatchers.argThat { (
          sessionNumberArg,
          sessionAttendanceArg,
          additionalAttendanceInformationArg,
          attendanceSubmittedAtArg,
          appointmentTimeArg,
          durationInMinutesArg,
          createdByArg,
          createdAtArg,
          actionPlanArg,
          _
        ) ->
          (
            sessionNumberArg == sessionNumber &&
              sessionAttendanceArg == null &&
              additionalAttendanceInformationArg == null &&
              attendanceSubmittedAtArg == null &&
              appointmentTimeArg == appointmentTime &&
              durationInMinutesArg == durationInMinutes &&
              createdByArg == createdByUser &&
              createdAtArg.isAfter(startTimeOfTest) &&
              actionPlanArg == actionPlan

            )
        }
      )
    ).thenReturn(actionPlanAppointment)

    val updatedAppointment = appointmentsService.updateAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes
    )

    assertThat(updatedAppointment).isEqualTo(actionPlanAppointment)
  }

  @Test
  fun `updates an appointment and throws exception if it not exists`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(null)

    val exception = assertThrows(EntityNotFoundException::class.java) {
      appointmentsService.updateAppointment(
        actionPlanId,
        sessionNumber,
        appointmentTime,
        durationInMinutes
      )
    }
    assertThat(exception.message).isEqualTo("Action plan appointment not found [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `gets an appointment`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(actionPlanAppointment)

    val actualAppointment = appointmentsService.getAppointment(actionPlanId, sessionNumber)

    assertThat(actualAppointment.sessionNumber).isEqualTo(actionPlanAppointment.sessionNumber)
    assertThat(actualAppointment.appointmentTime).isEqualTo(actionPlanAppointment.appointmentTime)
    assertThat(actualAppointment.durationInMinutes).isEqualTo(actionPlanAppointment.durationInMinutes)
  }

  @Test
  fun `gets an appointment and throws exception if it not exists`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(null)

    val exception = assertThrows(EntityNotFoundException::class.java) {
      appointmentsService.getAppointment(actionPlanId, sessionNumber)
    }
    assertThat(exception.message).isEqualTo("Action plan appointment not found [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `gets all appointments for an action plan`() {
    val actionPlanId = UUID.randomUUID()
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanAppointmentRepository.findAllByActionPlanId(actionPlanId)).thenReturn(listOf(actionPlanAppointment))

    val appointments = appointmentsService.getAppointments(actionPlanId)

    assertThat(appointments.first().sessionNumber).isEqualTo(actionPlanAppointment.sessionNumber)
    assertThat(appointments.first().appointmentTime).isEqualTo(actionPlanAppointment.appointmentTime)
    assertThat(appointments.first().durationInMinutes).isEqualTo(actionPlanAppointment.durationInMinutes)
  }

  @Test
  fun `update appointment with attendance`() {
    val appointmentId = UUID.randomUUID()
    val sessionNumber = 1
    val sessionAttendance = Attended.YES
    val additionalInformation = "extra info"
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()

    val existingAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(appointmentId, sessionNumber))
      .thenReturn(existingAppointment)
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(existingAppointment)

    val savedAppointment = appointmentsService.recordAttendance(appointmentId, 1, sessionAttendance, additionalInformation)
    val argumentCaptor: ArgumentCaptor<ActionPlanAppointment> = ArgumentCaptor.forClass(ActionPlanAppointment::class.java)

    verify(actionPlanAppointmentRepository).save(argumentCaptor.capture())
    assertThat(argumentCaptor.firstValue.attended).isEqualTo(sessionAttendance)
    assertThat(argumentCaptor.firstValue.additionalAttendanceInformation).isEqualTo(additionalInformation)
    assertThat(argumentCaptor.firstValue.attendanceSubmittedAt).isNotNull
    assertThat(savedAppointment).isNotNull
  }

  @Test
  fun `update appointment with attendance - no appointment found`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val attended = Attended.YES
    val additionalInformation = "extra info"

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber))
      .thenReturn(null)

    val exception = assertThrows(EntityNotFoundException::class.java) {
      appointmentsService.recordAttendance(actionPlanId, 1, attended, additionalInformation)
    }
    assertThat(exception.message).isEqualTo("Action plan appointment not found [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }
}

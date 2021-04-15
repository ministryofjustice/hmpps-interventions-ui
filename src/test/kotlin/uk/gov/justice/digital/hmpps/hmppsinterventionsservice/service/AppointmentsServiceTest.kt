package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.atLeastOnce
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.firstValue
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanAppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import java.time.OffsetDateTime
import java.util.Optional.of
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

internal class AppointmentsServiceTest {

  private val actionPlanRepository: ActionPlanRepository = mock()
  private val actionPlanAppointmentRepository: ActionPlanAppointmentRepository = mock()
  private val authUserRepository: AuthUserRepository = mock()
  private val appointmentEventPublisher: AppointmentEventPublisher = mock()
  private val communityAPIBookingService: CommunityAPIBookingService = mock()
  private val actionPlanFactory = ActionPlanFactory()

  private val appointmentsService = AppointmentsService(
    actionPlanAppointmentRepository, actionPlanRepository,
    authUserRepository, appointmentEventPublisher,
    communityAPIBookingService
  )

  @Test
  fun `creates an appointment`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(null)
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(actionPlanRepository.findById(actionPlanId)).thenReturn(of(actionPlan))
    val savedAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(savedAppointment)

    val createdAppointment = appointmentsService.createAppointment(
      actionPlan,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      createdByUser
    )

    assertThat(createdAppointment).isEqualTo(savedAppointment)
  }

  @Test
  fun `create unscheduled appointments creates one for each action plan session`() {
    val actionPlan = actionPlanFactory.create(numberOfSessions = 3)
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(eq(actionPlan.id), any())).thenReturn(null)
    whenever(authUserRepository.save(actionPlan.createdBy)).thenReturn(actionPlan.createdBy)
    whenever(actionPlanAppointmentRepository.save(any())).thenAnswer { it.arguments[0] }

    appointmentsService.createUnscheduledAppointmentsForActionPlan(actionPlan, actionPlan.createdBy)
    verify(actionPlanAppointmentRepository, times(3)).save(any())
  }

  @Test
  fun `create unscheduled appointments throws exception if session already exists`() {
    val actionPlan = actionPlanFactory.create(numberOfSessions = 1)
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1))
      .thenReturn(SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = actionPlan.createdBy))

    assertThrows(EntityExistsException::class.java) {
      appointmentsService.createUnscheduledAppointmentsForActionPlan(actionPlan, actionPlan.createdBy)
    }
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
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(actionPlanAppointment)

    val updatedAppointment = appointmentsService.updateAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes
    )

    assertThat(updatedAppointment).isEqualTo(actionPlanAppointment)
  }

  @Test
  fun `makes a booking when an appointment is updated`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(actionPlanAppointment)
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(actionPlanAppointment)

    val updatedAppointment = appointmentsService.updateAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes
    )

    assertThat(updatedAppointment).isEqualTo(actionPlanAppointment)
    verify(communityAPIBookingService).book(actionPlanAppointment, appointmentTime, durationInMinutes)
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
    val attended = Attended.YES
    val additionalInformation = "extra info"
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()

    val existingAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(appointmentId, sessionNumber))
      .thenReturn(existingAppointment)
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(existingAppointment)

    val savedAppointment = appointmentsService.recordAttendance(appointmentId, 1, attended, additionalInformation)
    val argumentCaptor: ArgumentCaptor<ActionPlanAppointment> = ArgumentCaptor.forClass(ActionPlanAppointment::class.java)

//    verify(appointmentEventPublisher).appointmentNotAttendedEvent(existingAppointment)
    verify(actionPlanAppointmentRepository).save(argumentCaptor.capture())
    assertThat(argumentCaptor.firstValue.attended).isEqualTo(attended)
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

  @Test
  fun `updating session behaviour sets relevant fields`() {
    val actionPlan = SampleData.sampleActionPlan()
    val appointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(any(), any())).thenReturn(appointment)
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(appointment)
    val updatedAppointment = appointmentsService.recordBehaviour(appointment.id, 1, "not good", false)

    verify(actionPlanAppointmentRepository, times(1)).save(appointment)
    assertThat(updatedAppointment).isSameAs(appointment)
    assertThat(appointment.attendanceBehaviour).isEqualTo("not good")
    assertThat(appointment.notifyPPOfAttendanceBehaviour).isFalse
    assertThat(appointment.attendanceBehaviourSubmittedAt).isNotNull
  }

  @Test
  fun `updating session behaviour for missing appointment throws error`() {
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(any(), any())).thenReturn(null)

    assertThrows(EntityNotFoundException::class.java) {
      appointmentsService.recordBehaviour(UUID.randomUUID(), 1, "not good", false)
    }
  }

  @Test
  fun `session feedback cant be submitted more than once`() {
    val actionPlan = SampleData.sampleActionPlan()
    val appointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(appointment)
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(appointment)

    appointmentsService.recordAttendance(actionPlan.id, 1, Attended.YES, "")
    appointmentsService.recordBehaviour(actionPlan.id, 1, "bad", false)
    appointment.sessionFeedbackSubmittedAt = OffsetDateTime.now()

    assertThrows(ResponseStatusException::class.java) {
      appointmentsService.submitSessionFeedback(actionPlan.id, 1)
    }
  }

  @Test
  fun `session feedback cant be submitted if attendance is missing`() {
    val actionPlan = SampleData.sampleActionPlan()
    val appointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(appointment)
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(appointment)

    appointmentsService.recordBehaviour(actionPlan.id, 1, "bad", false)

    assertThrows(ResponseStatusException::class.java) {
      appointmentsService.submitSessionFeedback(actionPlan.id, 1)
    }
  }

  @Test
  fun `session feedback can be submitted and stores timestamp and emits application events`() {
    val actionPlan = SampleData.sampleActionPlan()
    val appointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(
      appointment
    )
    whenever(actionPlanAppointmentRepository.save(any())).thenReturn(appointment)

    appointmentsService.recordAttendance(actionPlan.id, 1, Attended.YES, "")
    appointmentsService.recordBehaviour(actionPlan.id, 1, "bad", true)
    appointmentsService.submitSessionFeedback(actionPlan.id, 1)

    val appointmentCaptor = argumentCaptor<ActionPlanAppointment>()
    verify(actionPlanAppointmentRepository, atLeastOnce()).save(appointmentCaptor.capture())
    appointmentCaptor.allValues.forEach {
      if (it == appointmentCaptor.lastValue) {
        assertThat(it.sessionFeedbackSubmittedAt != null)
      } else {
        assertThat(it.sessionFeedbackSubmittedAt == null)
      }
    }

    verify(appointmentEventPublisher).attendanceRecordedEvent(appointment, false)
    verify(appointmentEventPublisher).behaviourRecordedEvent(appointment, true)
  }

  @Test
  fun `attendance can't be updated once session feedback has been submitted`() {
    val actionPlan = SampleData.sampleActionPlan()
    val appointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    appointment.sessionFeedbackSubmittedAt = OffsetDateTime.now()
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(appointment)

    assertThrows(ResponseStatusException::class.java) {
      appointmentsService.recordAttendance(actionPlan.id, 1, Attended.YES, "")
    }
  }

  @Test
  fun `behaviour can't be updated once session feedback has been submitted`() {
    val actionPlan = SampleData.sampleActionPlan()
    val appointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    appointment.sessionFeedbackSubmittedAt = OffsetDateTime.now()
    whenever(actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(appointment)

    assertThrows(ResponseStatusException::class.java) {
      appointmentsService.recordBehaviour(actionPlan.id, 1, "bad", false)
    }
  }
}

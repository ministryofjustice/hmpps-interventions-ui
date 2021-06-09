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
import org.mockito.ArgumentMatchers
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import java.time.OffsetDateTime
import java.util.Optional.of
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

internal class ActionPlanSessionsServiceTest {

  private val actionPlanRepository: ActionPlanRepository = mock()
  private val actionPlanSessionRepository: ActionPlanSessionRepository = mock()
  private val authUserRepository: AuthUserRepository = mock()
  private val appointmentEventPublisher: AppointmentEventPublisher = mock()
  private val communityAPIBookingService: CommunityAPIBookingService = mock()
  private val actionPlanFactory = ActionPlanFactory()

  private val actionPlanSessionsService = ActionPlanSessionsService(
    actionPlanSessionRepository, actionPlanRepository,
    authUserRepository, appointmentEventPublisher,
    communityAPIBookingService
  )

  @Test
  fun `creates a session`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(null)
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(actionPlanRepository.findById(actionPlanId)).thenReturn(of(actionPlan))
    val savedSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(savedSession)

    val createdSession = actionPlanSessionsService.createSession(
      actionPlan,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      createdByUser
    )

    assertThat(createdSession).isEqualTo(savedSession)
  }

  @Test
  fun `create unscheduled sessions creates one for each action plan session`() {
    val actionPlan = actionPlanFactory.create(numberOfSessions = 3)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(eq(actionPlan.id), any())).thenReturn(null)
    whenever(authUserRepository.save(actionPlan.createdBy)).thenReturn(actionPlan.createdBy)
    whenever(actionPlanSessionRepository.save(any())).thenAnswer { it.arguments[0] }

    actionPlanSessionsService.createUnscheduledSessionsForActionPlan(actionPlan, actionPlan.createdBy)
    verify(actionPlanSessionRepository, times(3)).save(any())
  }

  @Test
  fun `create unscheduled sessions throws exception if session already exists`() {
    val actionPlan = actionPlanFactory.create(numberOfSessions = 1)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1))
      .thenReturn(SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = actionPlan.createdBy))

    assertThrows(EntityExistsException::class.java) {
      actionPlanSessionsService.createUnscheduledSessionsForActionPlan(actionPlan, actionPlan.createdBy)
    }
  }

  @Test
  fun `updates a session`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(actionPlanSession)
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(actionPlanSession)

    val updatedSession = actionPlanSessionsService.updateSession(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes
    )

    assertThat(updatedSession).isEqualTo(actionPlanSession)
  }

  @Test
  fun `makes a booking when a session is updated`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(communityAPIBookingService.book(actionPlanSession, appointmentTime, durationInMinutes)).thenReturn(999L)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(actionPlanSession)
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(actionPlanSession)

    val updatedSession = actionPlanSessionsService.updateSession(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes
    )

    assertThat(updatedSession).isEqualTo(actionPlanSession)
    verify(communityAPIBookingService).book(actionPlanSession, appointmentTime, durationInMinutes)
    verify(actionPlanSessionRepository).save(
      ArgumentMatchers.argThat { (
        _, _, _, _, _, _, _, _, _, _, deliusAppointmentIdArg
      ) ->
        (
          deliusAppointmentIdArg == 999L
          )
      }
    )
  }

  @Test
  fun `does not make a booking when a session is updated because timings aren't present`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(communityAPIBookingService.book(actionPlanSession, appointmentTime, durationInMinutes)).thenReturn(null)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(actionPlanSession)
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(actionPlanSession)

    actionPlanSessionsService.updateSession(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes
    )

    verify(actionPlanSessionRepository).save(
      ArgumentMatchers.argThat { (
        _, _, _, _, _, _, _, _, _, _, deliusAppointmentIdArg
      ) ->
        (
          deliusAppointmentIdArg == null
          )
      }
    )
  }

  @Test
  fun `updates a session and throws exception if it not exists`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(null)

    val exception = assertThrows(EntityNotFoundException::class.java) {
      actionPlanSessionsService.updateSession(
        actionPlanId,
        sessionNumber,
        appointmentTime,
        durationInMinutes
      )
    }
    assertThat(exception.message).isEqualTo("Action plan session not found [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `gets a session`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(actionPlanSession)

    val actualSession = actionPlanSessionsService.getSession(actionPlanId, sessionNumber)

    assertThat(actualSession.sessionNumber).isEqualTo(actionPlanSession.sessionNumber)
    assertThat(actualSession.appointmentTime).isEqualTo(actionPlanSession.appointmentTime)
    assertThat(actualSession.durationInMinutes).isEqualTo(actionPlanSession.durationInMinutes)
  }

  @Test
  fun `gets a session and throws exception if it not exists`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(null)

    val exception = assertThrows(EntityNotFoundException::class.java) {
      actionPlanSessionsService.getSession(actionPlanId, sessionNumber)
    }
    assertThat(exception.message).isEqualTo("Action plan session not found [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `gets all sessions for an action plan`() {
    val actionPlanId = UUID.randomUUID()
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanSessionRepository.findAllByActionPlanId(actionPlanId)).thenReturn(listOf(actionPlanSession))

    val sessions = actionPlanSessionsService.getSessions(actionPlanId)

    assertThat(sessions.first().sessionNumber).isEqualTo(actionPlanSession.sessionNumber)
    assertThat(sessions.first().appointmentTime).isEqualTo(actionPlanSession.appointmentTime)
    assertThat(sessions.first().durationInMinutes).isEqualTo(actionPlanSession.durationInMinutes)
  }

  @Test
  fun `update session with attendance`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val attended = Attended.YES
    val additionalInformation = "extra info"
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()

    val existingSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber))
      .thenReturn(existingSession)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(existingSession)

    val savedSession = actionPlanSessionsService.recordAttendance(actionPlanId, 1, attended, additionalInformation)
    val argumentCaptor: ArgumentCaptor<ActionPlanSession> = ArgumentCaptor.forClass(ActionPlanSession::class.java)

//    verify(appointmentEventPublisher).appointmentNotAttendedEvent(existingSession)
    verify(actionPlanSessionRepository).save(argumentCaptor.capture())
    assertThat(argumentCaptor.firstValue.attended).isEqualTo(attended)
    assertThat(argumentCaptor.firstValue.additionalAttendanceInformation).isEqualTo(additionalInformation)
    assertThat(argumentCaptor.firstValue.attendanceSubmittedAt).isNotNull
    assertThat(savedSession).isNotNull
  }

  @Test
  fun `update session with attendance - no session found`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val attended = Attended.YES
    val additionalInformation = "extra info"

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber))
      .thenReturn(null)

    val exception = assertThrows(EntityNotFoundException::class.java) {
      actionPlanSessionsService.recordAttendance(actionPlanId, 1, attended, additionalInformation)
    }

    assertThat(exception.message).isEqualTo("Action plan session not found [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `updating session behaviour sets relevant fields`() {
    val actionPlan = SampleData.sampleActionPlan()
    val session = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(any(), any())).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)
    val updatedSession = actionPlanSessionsService.recordBehaviour(actionPlan.id, 1, "not good", false)

    verify(actionPlanSessionRepository, times(1)).save(session)
    assertThat(updatedSession).isSameAs(session)
    assertThat(session.attendanceBehaviour).isEqualTo("not good")
    assertThat(session.notifyPPOfAttendanceBehaviour).isFalse
    assertThat(session.attendanceBehaviourSubmittedAt).isNotNull
  }

  @Test
  fun `updating session behaviour for missing session throws error`() {
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(any(), any())).thenReturn(null)

    assertThrows(EntityNotFoundException::class.java) {
      actionPlanSessionsService.recordBehaviour(UUID.randomUUID(), 1, "not good", false)
    }
  }

  @Test
  fun `session feedback cant be submitted more than once`() {
    val actionPlan = SampleData.sampleActionPlan()
    val session = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    actionPlanSessionsService.recordAttendance(actionPlan.id, 1, Attended.YES, "")
    actionPlanSessionsService.recordBehaviour(actionPlan.id, 1, "bad", false)
    session.sessionFeedbackSubmittedAt = OffsetDateTime.now()

    assertThrows(ResponseStatusException::class.java) {
      actionPlanSessionsService.submitSessionFeedback(actionPlan.id, 1)
    }
  }

  @Test
  fun `session feedback cant be submitted if attendance is missing`() {
    val actionPlan = SampleData.sampleActionPlan()
    val session = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    actionPlanSessionsService.recordBehaviour(actionPlan.id, 1, "bad", false)

    assertThrows(ResponseStatusException::class.java) {
      actionPlanSessionsService.submitSessionFeedback(actionPlan.id, 1)
    }
  }

  @Test
  fun `session feedback can be submitted and stores timestamp and emits application events`() {
    val actionPlan = SampleData.sampleActionPlan()
    val session = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(
      session
    )
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    actionPlanSessionsService.recordAttendance(actionPlan.id, 1, Attended.YES, "")
    actionPlanSessionsService.recordBehaviour(actionPlan.id, 1, "bad", true)
    actionPlanSessionsService.submitSessionFeedback(actionPlan.id, 1)

    val sessionCaptor = argumentCaptor<ActionPlanSession>()
    verify(actionPlanSessionRepository, atLeastOnce()).save(sessionCaptor.capture())
    sessionCaptor.allValues.forEach {
      if (it == sessionCaptor.lastValue) {
        assertThat(it.sessionFeedbackSubmittedAt != null)
      } else {
        assertThat(it.sessionFeedbackSubmittedAt == null)
      }
    }

    verify(appointmentEventPublisher).attendanceRecordedEvent(session, false)
    verify(appointmentEventPublisher).behaviourRecordedEvent(session, true)
    verify(appointmentEventPublisher).sessionFeedbackRecordedEvent(session, true)
  }

  @Test
  fun `attendance can't be updated once session feedback has been submitted`() {
    val actionPlan = SampleData.sampleActionPlan()
    val session = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    session.sessionFeedbackSubmittedAt = OffsetDateTime.now()
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(session)

    assertThrows(ResponseStatusException::class.java) {
      actionPlanSessionsService.recordAttendance(actionPlan.id, 1, Attended.YES, "")
    }
  }

  @Test
  fun `behaviour can't be updated once session feedback has been submitted`() {
    val actionPlan = SampleData.sampleActionPlan()
    val session = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = actionPlan.createdBy)
    session.sessionFeedbackSubmittedAt = OffsetDateTime.now()
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1)).thenReturn(session)

    assertThrows(ResponseStatusException::class.java) {
      actionPlanSessionsService.recordBehaviour(actionPlan.id, 1, "bad", false)
    }
  }
}

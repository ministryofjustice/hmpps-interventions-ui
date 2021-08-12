package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.atLeastOnce
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.firstValue
import com.nhaarman.mockitokotlin2.isNull
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType.SERVICE_DELIVERY
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanSessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

internal class ActionPlanSessionsServiceTest {

  private val actionPlanRepository: ActionPlanRepository = mock()
  private val actionPlanSessionRepository: ActionPlanSessionRepository = mock()
  private val authUserRepository: AuthUserRepository = mock()
  private val actionPlanAppointmentEventPublisher: ActionPlanAppointmentEventPublisher = mock()
  private val communityAPIBookingService: CommunityAPIBookingService = mock()
  private val appointmentRepository: AppointmentRepository = mock()
  private val appointmentService: AppointmentService = mock()
  private val actionPlanFactory = ActionPlanFactory()
  private val actionPlanSessionFactory = ActionPlanSessionFactory()
  private val authUserFactory = AuthUserFactory()

  private val actionPlanSessionsService = ActionPlanSessionsService(
    actionPlanSessionRepository, actionPlanRepository,
    authUserRepository, actionPlanAppointmentEventPublisher,
    communityAPIBookingService, appointmentService, appointmentRepository,
  )

  private fun createActor(userName: String = "action_plan_session_test"): AuthUser =
    authUserFactory.create(userName = userName)
      .also { whenever(authUserRepository.save(it)).thenReturn(it) }

  @Test
  fun `create unscheduled sessions creates one for each action plan session`() {
    val actionPlan = actionPlanFactory.create(numberOfSessions = 3)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(eq(actionPlan.id), any())).thenReturn(null)
    whenever(authUserRepository.save(actionPlan.createdBy)).thenReturn(actionPlan.createdBy)
    whenever(actionPlanSessionRepository.save(any())).thenAnswer { it.arguments[0] }

    actionPlanSessionsService.createUnscheduledSessionsForActionPlan(actionPlan)
    verify(actionPlanSessionRepository, times(3)).save(any())
  }

  @Test
  fun `create unscheduled sessions throws exception if session already exists`() {
    val actionPlan = actionPlanFactory.create(numberOfSessions = 1)

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlan.id, 1))
      .thenReturn(actionPlanSessionFactory.createUnscheduled(sessionNumber = 1))

    assertThrows(EntityExistsException::class.java) {
      actionPlanSessionsService.createUnscheduledSessionsForActionPlan(actionPlan)
    }
  }

  @Test
  fun `updates a session appointment for an unscheduled session`() {
    val session = actionPlanSessionFactory.createUnscheduled()
    val actionPlanId = session.actionPlan.id
    val sessionNumber = session.sessionNumber
    val user = createActor("scheduler")

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 200
    val updatedSession = actionPlanSessionsService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      user,
      AppointmentDeliveryType.PHONE_CALL,
      AppointmentSessionType.ONE_TO_ONE,
      null
    )

    verify(appointmentService, times(1)).createOrUpdateAppointmentDeliveryDetails(any(), eq(AppointmentDeliveryType.PHONE_CALL), eq(AppointmentSessionType.ONE_TO_ONE), isNull(), isNull())
    assertThat(updatedSession.currentAppointment?.appointmentTime).isEqualTo(appointmentTime)
    assertThat(updatedSession.currentAppointment?.durationInMinutes).isEqualTo(durationInMinutes)
    assertThat(updatedSession.currentAppointment?.createdBy?.userName).isEqualTo("scheduler")
  }

  @Test
  fun `updates a session appointment for a scheduled session`() {
    val originalTime = OffsetDateTime.now()
    val originalDuration = 60
    val session = actionPlanSessionFactory.createScheduled(appointmentTime = originalTime, durationInMinutes = originalDuration)
    val actionPlanId = session.actionPlan.id
    val sessionNumber = session.sessionNumber
    val user = createActor("re-scheduler")

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val newTime = OffsetDateTime.now()
    val newDuration = 200
    val updatedSession = actionPlanSessionsService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      newTime,
      newDuration,
      user,
      AppointmentDeliveryType.PHONE_CALL,
      AppointmentSessionType.ONE_TO_ONE,
      null
    )

    verify(appointmentService, times(1)).createOrUpdateAppointmentDeliveryDetails(any(), eq(AppointmentDeliveryType.PHONE_CALL), eq(AppointmentSessionType.ONE_TO_ONE), isNull(), isNull())
    assertThat(updatedSession.currentAppointment?.appointmentTime).isEqualTo(newTime)
    assertThat(updatedSession.currentAppointment?.durationInMinutes).isEqualTo(newDuration)
    assertThat(updatedSession.currentAppointment?.createdBy?.userName).isNotEqualTo("re-scheduler")
  }

  @Test
  fun `makes a booking when a session is updated`() {
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id
    val sessionNumber = session.sessionNumber
    val referral = session.actionPlan.referral
    val createdByUser = createActor("scheduler")
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15

    whenever(
      communityAPIBookingService.book(
        referral,
        session.currentAppointment,
        appointmentTime,
        durationInMinutes,
        SERVICE_DELIVERY,
        null
      )
    ).thenReturn(999L)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber))
      .thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val updatedSession = actionPlanSessionsService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      createdByUser,
      AppointmentDeliveryType.PHONE_CALL,
      AppointmentSessionType.ONE_TO_ONE,
      null
    )

    assertThat(updatedSession).isEqualTo(session)
    verify(appointmentService, times(1)).createOrUpdateAppointmentDeliveryDetails(any(), eq(AppointmentDeliveryType.PHONE_CALL), eq(AppointmentSessionType.ONE_TO_ONE), isNull(), isNull())
    verify(communityAPIBookingService).book(
      referral,
      session.currentAppointment,
      appointmentTime,
      durationInMinutes,
      SERVICE_DELIVERY,
      null
    )
    verify(appointmentRepository, times(1)).saveAndFlush(
      ArgumentMatchers.argThat {
        it.deliusAppointmentId == 999L
      }
    )
  }

  @Test
  fun `does not make a booking when a session is updated because timings aren't present`() {
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id
    val sessionNumber = session.sessionNumber
    val referral = session.actionPlan.referral
    val createdByUser = createActor("scheduler")
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15

    whenever(
      communityAPIBookingService.book(
        referral,
        session.currentAppointment,
        appointmentTime,
        durationInMinutes,
        SERVICE_DELIVERY,
        null
      )
    ).thenReturn(null)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    actionPlanSessionsService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      createdByUser,
      AppointmentDeliveryType.PHONE_CALL,
      AppointmentSessionType.ONE_TO_ONE,
      null
    )

    verify(appointmentService, times(1)).createOrUpdateAppointmentDeliveryDetails(any(), eq(AppointmentDeliveryType.PHONE_CALL), eq(AppointmentSessionType.ONE_TO_ONE), isNull(), isNull())
    verify(appointmentRepository, times(1)).saveAndFlush(
      ArgumentMatchers.argThat {
        it.deliusAppointmentId == null
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
      actionPlanSessionsService.updateSessionAppointment(
        actionPlanId,
        sessionNumber,
        appointmentTime,
        durationInMinutes,
        authUserFactory.create(),
        AppointmentDeliveryType.PHONE_CALL,
        AppointmentSessionType.ONE_TO_ONE,
        null
      )
    }
    assertThat(exception.message).isEqualTo("Action plan session not found [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `gets a session`() {
    val time = OffsetDateTime.now()
    val duration = 500
    val session = actionPlanSessionFactory.createScheduled(sessionNumber = 1, appointmentTime = time, durationInMinutes = duration)
    val actionPlanId = session.actionPlan.id

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)

    val actualSession = actionPlanSessionsService.getSession(actionPlanId, 1)

    assertThat(actualSession.sessionNumber).isEqualTo(1)
    assertThat(actualSession.currentAppointment?.appointmentTime).isEqualTo(time)
    assertThat(actualSession.currentAppointment?.durationInMinutes).isEqualTo(duration)
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
    val time = OffsetDateTime.now()
    val duration = 500
    val session = actionPlanSessionFactory.createScheduled(sessionNumber = 1, appointmentTime = time, durationInMinutes = duration)
    val actionPlanId = session.actionPlan.id

    whenever(actionPlanSessionRepository.findAllByActionPlanId(actionPlanId)).thenReturn(listOf(session))

    val sessions = actionPlanSessionsService.getSessions(actionPlanId)

    assertThat(sessions.first().sessionNumber).isEqualTo(1)
    assertThat(sessions.first().currentAppointment?.appointmentTime).isEqualTo(time)
    assertThat(sessions.first().currentAppointment?.durationInMinutes).isEqualTo(duration)
  }

  @Test
  fun `update session with attendance`() {
    val attended = Attended.YES
    val additionalInformation = "extra info"

    val existingSession = actionPlanSessionFactory.createScheduled(sessionNumber = 1)
    val actionPlanId = existingSession.actionPlan.id

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1))
      .thenReturn(existingSession)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(existingSession)

    val actor = createActor("attendance_submitter")
    val savedSession = actionPlanSessionsService.recordAppointmentAttendance(actor, actionPlanId, 1, attended, additionalInformation)
    val argumentCaptor: ArgumentCaptor<ActionPlanSession> = ArgumentCaptor.forClass(ActionPlanSession::class.java)

//    verify(appointmentEventPublisher).appointmentNotAttendedEvent(existingSession)
    verify(actionPlanSessionRepository).save(argumentCaptor.capture())
    assertThat(argumentCaptor.firstValue.currentAppointment?.attended).isEqualTo(attended)
    assertThat(argumentCaptor.firstValue.currentAppointment?.additionalAttendanceInformation).isEqualTo(additionalInformation)
    assertThat(argumentCaptor.firstValue.currentAppointment?.attendanceSubmittedAt).isNotNull
    assertThat(argumentCaptor.firstValue.currentAppointment?.attendanceSubmittedBy?.userName).isEqualTo("attendance_submitter")
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

    val actor = createActor()
    val exception = assertThrows(EntityNotFoundException::class.java) {
      actionPlanSessionsService.recordAppointmentAttendance(actor, actionPlanId, 1, attended, additionalInformation)
    }

    assertThat(exception.message).isEqualTo("Action plan session not found [id=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `updating session behaviour sets relevant fields`() {
    val session = actionPlanSessionFactory.createScheduled()
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(any(), any())).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val actor = createActor("behaviour_submitter")
    val updatedSession = actionPlanSessionsService.recordBehaviour(actor, session.actionPlan.id, 1, "not good", false)

    verify(actionPlanSessionRepository, times(1)).save(session)
    assertThat(updatedSession).isSameAs(session)
    assertThat(session.currentAppointment?.attendanceBehaviour).isEqualTo("not good")
    assertThat(session.currentAppointment?.notifyPPOfAttendanceBehaviour).isFalse
    assertThat(session.currentAppointment?.attendanceBehaviourSubmittedAt).isNotNull
    assertThat(session.currentAppointment?.attendanceBehaviourSubmittedBy?.userName).isEqualTo("behaviour_submitter")
  }

  @Test
  fun `updating session behaviour for missing session throws error`() {
    val actor = createActor()
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(any(), any())).thenReturn(null)

    assertThrows(EntityNotFoundException::class.java) {
      actionPlanSessionsService.recordBehaviour(actor, UUID.randomUUID(), 1, "not good", false)
    }
  }

  @Test
  fun `session feedback cant be submitted more than once`() {
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id

    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val actor = createActor()
    actionPlanSessionsService.recordAppointmentAttendance(actor, actionPlanId, 1, Attended.YES, "")
    actionPlanSessionsService.recordBehaviour(actor, actionPlanId, 1, "bad", false)

    actionPlanSessionsService.submitSessionFeedback(actionPlanId, 1, actor)
    val exception = assertThrows(ResponseStatusException::class.java) {
      actionPlanSessionsService.submitSessionFeedback(actionPlanId, 1, actor)
    }
    assertThat(exception.status).isEqualTo(HttpStatus.CONFLICT)
  }

  @Test
  fun `session feedback can't be submitted without attendance`() {
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id

    val actor = createActor()
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    actionPlanSessionsService.recordBehaviour(actor, actionPlanId, 1, "bad", false)

    val exception = assertThrows(ResponseStatusException::class.java) {
      actionPlanSessionsService.submitSessionFeedback(actionPlanId, 1, actor)
    }
    assertThat(exception.status).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY)
  }

  @Test
  fun `session feedback can be submitted and stores time and actor`() {
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(
      session
    )
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val user = createActor()
    actionPlanSessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.YES, "")
    actionPlanSessionsService.recordBehaviour(user, actionPlanId, 1, "bad", true)

    val submitter = createActor("test-submitter")
    actionPlanSessionsService.submitSessionFeedback(actionPlanId, 1, submitter)

    val sessionCaptor = argumentCaptor<ActionPlanSession>()
    verify(actionPlanSessionRepository, atLeastOnce()).save(sessionCaptor.capture())
    sessionCaptor.allValues.forEach {
      if (it == sessionCaptor.lastValue) {
        assertThat(it.currentAppointment?.appointmentFeedbackSubmittedAt != null)
        assertThat(it.currentAppointment?.appointmentFeedbackSubmittedBy?.userName).isEqualTo("test-submitter")
      } else {
        assertThat(it.currentAppointment?.appointmentFeedbackSubmittedAt == null)
        assertThat(it.currentAppointment?.appointmentFeedbackSubmittedBy == null)
      }
    }
  }

  @Test
  fun `session feedback emits application events`() {
    val user = createActor()
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(
      session
    )
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)
    actionPlanSessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.YES, "")
    actionPlanSessionsService.recordBehaviour(user, actionPlanId, 1, "bad", true)

    actionPlanSessionsService.submitSessionFeedback(actionPlanId, 1, session.actionPlan.createdBy)
    verify(actionPlanAppointmentEventPublisher).attendanceRecordedEvent(session, false)
    verify(actionPlanAppointmentEventPublisher).behaviourRecordedEvent(session, true)
    verify(actionPlanAppointmentEventPublisher).sessionFeedbackRecordedEvent(session, true)
  }

  @Test
  fun `attendance can't be updated once session feedback has been submitted`() {
    val user = createActor()
    val session = actionPlanSessionFactory.createAttended()
    val actionPlanId = session.actionPlan.id
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)

    assertThrows(ResponseStatusException::class.java) {
      actionPlanSessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.YES, "")
    }
  }

  @Test
  fun `behaviour can't be updated once session feedback has been submitted`() {
    val user = createActor()
    val session = actionPlanSessionFactory.createAttended()
    val actionPlanId = session.actionPlan.id
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)

    assertThrows(ResponseStatusException::class.java) {
      actionPlanSessionsService.recordBehaviour(user, actionPlanId, 1, "bad", false)
    }
  }

  @Test
  fun `session feedback can be submitted when session not attended`() {
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(
      session
    )
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val user = createActor()
    actionPlanSessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.NO, "")
    actionPlanSessionsService.submitSessionFeedback(actionPlanId, 1, user)

    verify(actionPlanSessionRepository, atLeastOnce()).save(session)
    verify(actionPlanAppointmentEventPublisher).attendanceRecordedEvent(session, true)
    verify(actionPlanAppointmentEventPublisher).sessionFeedbackRecordedEvent(session, false)
  }

  @Test
  fun `session feedback can be submitted when session is attended and there is no behaviour feedback`() {
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(
      session
    )
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val user = createActor()
    actionPlanSessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.YES, "")
    actionPlanSessionsService.submitSessionFeedback(actionPlanId, 1, user)

    verify(actionPlanSessionRepository, atLeastOnce()).save(session)
    verify(actionPlanAppointmentEventPublisher).attendanceRecordedEvent(session, false)
    verify(actionPlanAppointmentEventPublisher).sessionFeedbackRecordedEvent(session, false)
  }

  @Test
  fun `makes a booking with delius office location`() {
    val session = actionPlanSessionFactory.createScheduled()
    val actionPlanId = session.actionPlan.id
    val sessionNumber = session.sessionNumber
    val referral = session.actionPlan.referral
    val createdByUser = session.actionPlan.createdBy
    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 15
    val npsOfficeCode = "CRS0001"

    whenever(
      communityAPIBookingService.book(
        referral,
        session.currentAppointment,
        appointmentTime,
        durationInMinutes,
        SERVICE_DELIVERY,
        npsOfficeCode
      )
    ).thenReturn(999L)
    whenever(actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(
      session
    )
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(actionPlanSessionRepository.save(any())).thenReturn(session)

    val updatedSession = actionPlanSessionsService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      createdByUser,
      AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE,
      AppointmentSessionType.ONE_TO_ONE,
      null,
      npsOfficeCode
    )

    assertThat(updatedSession).isEqualTo(session)
    verify(appointmentService, times(1)).createOrUpdateAppointmentDeliveryDetails(any(), eq(AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE), eq(AppointmentSessionType.ONE_TO_ONE), isNull(), eq(npsOfficeCode))
    verify(communityAPIBookingService).book(
      referral,
      session.currentAppointment,
      appointmentTime,
      durationInMinutes,
      SERVICE_DELIVERY,
      npsOfficeCode
    )
    verify(appointmentRepository, times(1)).saveAndFlush(
      ArgumentMatchers.argThat {
        it.deliusAppointmentId == 999L
      }
    )
  }
}

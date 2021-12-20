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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType.SERVICE_DELIVERY
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DeliverySession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DeliverySessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

internal class DeliverySessionsServiceTest {

  private val actionPlanRepository: ActionPlanRepository = mock()
  private val deliverySessionRepository: DeliverySessionRepository = mock()
  private val authUserRepository: AuthUserRepository = mock()
  private val actionPlanAppointmentEventPublisher: ActionPlanAppointmentEventPublisher = mock()
  private val communityAPIBookingService: CommunityAPIBookingService = mock()
  private val appointmentRepository: AppointmentRepository = mock()
  private val appointmentService: AppointmentService = mock()
  private val actionPlanFactory = ActionPlanFactory()
  private val deliverySessionFactory = DeliverySessionFactory()
  private val authUserFactory = AuthUserFactory()
  private val referralFactory = ReferralFactory()

  private val deliverySessionsService = DeliverySessionService(
    deliverySessionRepository, actionPlanRepository,
    authUserRepository, actionPlanAppointmentEventPublisher,
    communityAPIBookingService, appointmentService, appointmentRepository,
  )

  private fun createActor(userName: String = "action_plan_session_test"): AuthUser =
    authUserFactory.create(userName = userName)
      .also { whenever(authUserRepository.save(it)).thenReturn(it) }

  @Test
  fun `create unscheduled sessions creates one for each action plan session`() {
    val actionPlan = actionPlanFactory.create(numberOfSessions = 3)
    whenever(deliverySessionRepository.findByReferralIdAndSessionNumber(eq(actionPlan.referral.id), any())).thenReturn(null)
    whenever(authUserRepository.save(actionPlan.createdBy)).thenReturn(actionPlan.createdBy)
    whenever(deliverySessionRepository.save(any())).thenAnswer { it.arguments[0] }

    deliverySessionsService.createUnscheduledSessionsForActionPlan(actionPlan)
    verify(deliverySessionRepository, times(3)).save(any())
  }

  @Test
  fun `create unscheduled sessions where there is a previously approved action plan`() {
    val newActionPlanId = UUID.randomUUID()
    val referral = referralFactory.createSent()
    val previouslyApprovedActionPlan = actionPlanFactory.createApproved(numberOfSessions = 2, referral = referral)
    val newActionPlan = actionPlanFactory.createSubmitted(id = newActionPlanId, numberOfSessions = 3, referral = referral)
    referral.actionPlans = mutableListOf(previouslyApprovedActionPlan, newActionPlan)

    whenever(deliverySessionRepository.findAllByActionPlanId(any())).thenReturn(listOf(deliverySessionFactory.createAttended(), deliverySessionFactory.createAttended()))
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(eq(newActionPlan.id), any())).thenReturn(null)
    whenever(authUserRepository.save(newActionPlan.createdBy)).thenReturn(newActionPlan.createdBy)
    whenever(deliverySessionRepository.save(any())).thenAnswer { it.arguments[0] }

    deliverySessionsService.createUnscheduledSessionsForActionPlan(newActionPlan)
    verify(deliverySessionRepository, times(1)).save(any())
  }

  @Test
  fun `create unscheduled sessions throws exception if session already exists`() {
    val actionPlan = actionPlanFactory.create(numberOfSessions = 1)

    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlan.id, 1))
      .thenReturn(deliverySessionFactory.createUnscheduled(sessionNumber = 1))

    assertThrows(EntityExistsException::class.java) {
      deliverySessionsService.createUnscheduledSessionsForActionPlan(actionPlan)
    }
  }

  @Test
  fun `updates a session appointment for an unscheduled session`() {
    val session = deliverySessionFactory.createUnscheduled()
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = session.sessionNumber
    val user = createActor("scheduler")

    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val appointmentTime = OffsetDateTime.now().plusHours(1)
    val durationInMinutes = 200
    val updatedSession = deliverySessionsService.updateSessionAppointment(
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
    assertThat(updatedSession.currentAppointment?.attended).isNull()
    assertThat(updatedSession.currentAppointment?.additionalAttendanceInformation).isNull()
    assertThat(updatedSession.currentAppointment?.notifyPPOfAttendanceBehaviour).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceBehaviour).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceSubmittedAt).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceSubmittedBy).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceBehaviourSubmittedAt).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceBehaviourSubmittedBy).isNull()
    assertThat(updatedSession.currentAppointment?.appointmentFeedbackSubmittedAt).isNull()
    assertThat(updatedSession.currentAppointment?.appointmentFeedbackSubmittedBy).isNull()
  }

  @Test
  fun `create session appointment for a historic appointment`() {
    val session = deliverySessionFactory.createUnscheduled()
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = session.sessionNumber
    val user = createActor("scheduler")

    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 200
    val updatedSession = deliverySessionsService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      user,
      AppointmentDeliveryType.PHONE_CALL,
      AppointmentSessionType.ONE_TO_ONE,
      null,
      null,
      Attended.YES,
      "additional information",
      false,
      "description"
    )

    verify(appointmentService, times(1)).createOrUpdateAppointmentDeliveryDetails(any(), eq(AppointmentDeliveryType.PHONE_CALL), eq(AppointmentSessionType.ONE_TO_ONE), isNull(), isNull())
    verify(actionPlanAppointmentEventPublisher).attendanceRecordedEvent(updatedSession)
    verify(actionPlanAppointmentEventPublisher).behaviourRecordedEvent(updatedSession)
    verify(actionPlanAppointmentEventPublisher).sessionFeedbackRecordedEvent(updatedSession)
    assertThat(updatedSession.currentAppointment?.appointmentTime).isEqualTo(appointmentTime)
    assertThat(updatedSession.currentAppointment?.durationInMinutes).isEqualTo(durationInMinutes)
    assertThat(updatedSession.currentAppointment?.createdBy?.userName).isEqualTo("scheduler")
    assertThat(updatedSession.currentAppointment?.attended).isEqualTo(Attended.YES)
    assertThat(updatedSession.currentAppointment?.additionalAttendanceInformation).isEqualTo("additional information")
    assertThat(updatedSession.currentAppointment?.notifyPPOfAttendanceBehaviour).isEqualTo(false)
    assertThat(updatedSession.currentAppointment?.attendanceBehaviour).isEqualTo("description")
    assertThat(updatedSession.currentAppointment?.attendanceSubmittedAt).isNotNull
    assertThat(updatedSession.currentAppointment?.attendanceSubmittedBy).isNotNull
    assertThat(updatedSession.currentAppointment?.attendanceBehaviourSubmittedAt).isNotNull
    assertThat(updatedSession.currentAppointment?.attendanceBehaviourSubmittedBy).isNotNull
    assertThat(updatedSession.currentAppointment?.appointmentFeedbackSubmittedAt).isNotNull
    assertThat(updatedSession.currentAppointment?.appointmentFeedbackSubmittedBy).isNotNull
  }

  @Test
  fun `updates session appointment for a historic appointment non attended`() {
    val session = deliverySessionFactory.createUnscheduled()
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = session.sessionNumber
    val user = createActor("scheduler")

    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val appointmentTime = OffsetDateTime.now()
    val durationInMinutes = 200
    val updatedSession = deliverySessionsService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      appointmentTime,
      durationInMinutes,
      user,
      AppointmentDeliveryType.PHONE_CALL,
      AppointmentSessionType.ONE_TO_ONE,
      null,
      null,
      Attended.NO,
      "additional information"
    )

    verify(appointmentService, times(1)).createOrUpdateAppointmentDeliveryDetails(any(), eq(AppointmentDeliveryType.PHONE_CALL), eq(AppointmentSessionType.ONE_TO_ONE), isNull(), isNull())
    assertThat(updatedSession.currentAppointment?.appointmentTime).isEqualTo(appointmentTime)
    assertThat(updatedSession.currentAppointment?.durationInMinutes).isEqualTo(durationInMinutes)
    assertThat(updatedSession.currentAppointment?.createdBy?.userName).isEqualTo("scheduler")
    assertThat(updatedSession.currentAppointment?.attended).isEqualTo(Attended.NO)
    assertThat(updatedSession.currentAppointment?.additionalAttendanceInformation).isEqualTo("additional information")
    assertThat(updatedSession.currentAppointment?.notifyPPOfAttendanceBehaviour).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceBehaviour).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceSubmittedAt).isNotNull
    assertThat(updatedSession.currentAppointment?.attendanceSubmittedBy).isEqualTo(user)
    assertThat(updatedSession.currentAppointment?.attendanceBehaviourSubmittedAt).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceBehaviourSubmittedBy).isNull()
    assertThat(updatedSession.currentAppointment?.appointmentFeedbackSubmittedAt).isNotNull
    assertThat(updatedSession.currentAppointment?.appointmentFeedbackSubmittedBy).isEqualTo(user)
  }

  @Test
  fun `updates a session appointment for a scheduled session`() {
    val originalTime = OffsetDateTime.now()
    val originalDuration = 60
    val session = deliverySessionFactory.createScheduled(appointmentTime = originalTime, durationInMinutes = originalDuration)
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = session.sessionNumber
    val user = createActor("re-scheduler")

    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val newTime = OffsetDateTime.now()
    val newDuration = 200
    val updatedSession = deliverySessionsService.updateSessionAppointment(
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
    assertThat(updatedSession.currentAppointment?.attended).isNull()
    assertThat(updatedSession.currentAppointment?.additionalAttendanceInformation).isNull()
    assertThat(updatedSession.currentAppointment?.notifyPPOfAttendanceBehaviour).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceBehaviour).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceSubmittedAt).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceSubmittedBy).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceBehaviourSubmittedAt).isNull()
    assertThat(updatedSession.currentAppointment?.attendanceBehaviourSubmittedBy).isNull()
    assertThat(updatedSession.currentAppointment?.appointmentFeedbackSubmittedAt).isNull()
  }

  @Test
  fun `makes a booking when a session is updated`() {
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = session.sessionNumber
    val referral = session.referral
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
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber))
      .thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val updatedSession = deliverySessionsService.updateSessionAppointment(
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
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = session.sessionNumber
    val referral = session.referral
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
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    deliverySessionsService.updateSessionAppointment(
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

    whenever(deliverySessionRepository.findByReferralIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(null)

    val exception = assertThrows(EntityNotFoundException::class.java) {
      deliverySessionsService.updateSessionAppointment(
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
    assertThat(exception.message).isEqualTo("Action plan session not found [actionPlanId=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `gets a session`() {
    val time = OffsetDateTime.now()
    val duration = 500
    val session = deliverySessionFactory.createScheduled(sessionNumber = 1, appointmentTime = time, durationInMinutes = duration)

    whenever(deliverySessionRepository.findByReferralIdAndSessionNumber(session.referral.id, 1)).thenReturn(session)

    val actualSession = deliverySessionsService.getSession(session.referral.id, 1)

    assertThat(actualSession.sessionNumber).isEqualTo(1)
    assertThat(actualSession.currentAppointment?.appointmentTime).isEqualTo(time)
    assertThat(actualSession.currentAppointment?.durationInMinutes).isEqualTo(duration)
  }

  @Test
  fun `gets a session and throws exception if it not exists`() {
    val referralId = UUID.randomUUID()
    val sessionNumber = 1

    whenever(deliverySessionRepository.findByReferralIdAndSessionNumber(referralId, sessionNumber)).thenReturn(null)

    val exception = assertThrows(EntityNotFoundException::class.java) {
      deliverySessionsService.getSession(referralId, sessionNumber)
    }
    assertThat(exception.message).isEqualTo("Action plan session not found [referralId=$referralId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `gets all sessions for an action plan`() {
    val time = OffsetDateTime.now()
    val duration = 500
    val session = deliverySessionFactory.createScheduled(sessionNumber = 1, appointmentTime = time, durationInMinutes = duration)
    val referralId = UUID.randomUUID()

    whenever(deliverySessionRepository.findAllByReferralId(referralId)).thenReturn(listOf(session))

    val sessions = deliverySessionsService.getSessions(referralId)

    assertThat(sessions.first().sessionNumber).isEqualTo(1)
    assertThat(sessions.first().currentAppointment?.appointmentTime).isEqualTo(time)
    assertThat(sessions.first().currentAppointment?.durationInMinutes).isEqualTo(duration)
  }

  @Test
  fun `update session with attendance`() {
    val attended = Attended.YES
    val additionalInformation = "extra info"

    val existingSession = deliverySessionFactory.createScheduled(sessionNumber = 1)
    val actionPlanId = UUID.randomUUID()

    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1))
      .thenReturn(existingSession)
    whenever(deliverySessionRepository.save(any())).thenReturn(existingSession)

    val actor = createActor("attendance_submitter")
    val savedSession = deliverySessionsService.recordAppointmentAttendance(actor, actionPlanId, 1, attended, additionalInformation)
    val argumentCaptor: ArgumentCaptor<DeliverySession> = ArgumentCaptor.forClass(DeliverySession::class.java)

//    verify(appointmentEventPublisher).appointmentNotAttendedEvent(existingSession)
    verify(deliverySessionRepository).save(argumentCaptor.capture())
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

    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber))
      .thenReturn(null)

    val actor = createActor()
    val exception = assertThrows(EntityNotFoundException::class.java) {
      deliverySessionsService.recordAppointmentAttendance(actor, actionPlanId, 1, attended, additionalInformation)
    }

    assertThat(exception.message).isEqualTo("Action plan session not found [actionPlanId=$actionPlanId, sessionNumber=$sessionNumber]")
  }

  @Test
  fun `updating session behaviour sets relevant fields`() {
    val actionPlanId = UUID.randomUUID()
    val session = deliverySessionFactory.createScheduled()
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(any(), any())).thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val actor = createActor("behaviour_submitter")
    val updatedSession = deliverySessionsService.recordBehaviour(actor, actionPlanId, 1, "not good", false)

    verify(deliverySessionRepository, times(1)).save(session)
    assertThat(updatedSession).isSameAs(session)
    assertThat(session.currentAppointment?.attendanceBehaviour).isEqualTo("not good")
    assertThat(session.currentAppointment?.notifyPPOfAttendanceBehaviour).isFalse
    assertThat(session.currentAppointment?.attendanceBehaviourSubmittedAt).isNotNull
    assertThat(session.currentAppointment?.attendanceBehaviourSubmittedBy?.userName).isEqualTo("behaviour_submitter")
  }

  @Test
  fun `updating session behaviour for missing session throws error`() {
    val actor = createActor()
    whenever(deliverySessionRepository.findByReferralIdAndSessionNumber(any(), any())).thenReturn(null)

    assertThrows(EntityNotFoundException::class.java) {
      deliverySessionsService.recordBehaviour(actor, UUID.randomUUID(), 1, "not good", false)
    }
  }

  @Test
  fun `session feedback cant be submitted more than once`() {
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()

    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val actor = createActor()
    deliverySessionsService.recordAppointmentAttendance(actor, actionPlanId, 1, Attended.YES, "")
    deliverySessionsService.recordBehaviour(actor, actionPlanId, 1, "bad", false)

    deliverySessionsService.submitSessionFeedback(actionPlanId, 1, actor)
    val exception = assertThrows(ResponseStatusException::class.java) {
      deliverySessionsService.submitSessionFeedback(actionPlanId, 1, actor)
    }
    assertThat(exception.status).isEqualTo(HttpStatus.CONFLICT)
  }

  @Test
  fun `session feedback can't be submitted without attendance`() {
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()

    val actor = createActor()
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    deliverySessionsService.recordBehaviour(actor, actionPlanId, 1, "bad", false)

    val exception = assertThrows(ResponseStatusException::class.java) {
      deliverySessionsService.submitSessionFeedback(actionPlanId, 1, actor)
    }
    assertThat(exception.status).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY)
  }

  @Test
  fun `session feedback can be submitted and stores time and actor`() {
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(
      session
    )
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val user = createActor()
    deliverySessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.YES, "")
    deliverySessionsService.recordBehaviour(user, actionPlanId, 1, "bad", true)

    val submitter = createActor("test-submitter")
    deliverySessionsService.submitSessionFeedback(actionPlanId, 1, submitter)

    val sessionCaptor = argumentCaptor<DeliverySession>()
    verify(deliverySessionRepository, atLeastOnce()).save(sessionCaptor.capture())
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
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(
      session
    )
    whenever(deliverySessionRepository.save(any())).thenReturn(session)
    deliverySessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.YES, "")
    deliverySessionsService.recordBehaviour(user, actionPlanId, 1, "bad", true)

    deliverySessionsService.submitSessionFeedback(actionPlanId, 1, session.referral.createdBy)
    verify(actionPlanAppointmentEventPublisher).attendanceRecordedEvent(session)
    verify(actionPlanAppointmentEventPublisher).behaviourRecordedEvent(session)
    verify(actionPlanAppointmentEventPublisher).sessionFeedbackRecordedEvent(session)
  }

  @Test
  fun `attendance can't be updated once session feedback has been submitted`() {
    val user = createActor()
    val session = deliverySessionFactory.createAttended()
    val actionPlanId = UUID.randomUUID()
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)

    assertThrows(ResponseStatusException::class.java) {
      deliverySessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.YES, "")
    }
  }

  @Test
  fun `behaviour can't be updated once session feedback has been submitted`() {
    val user = createActor()
    val session = deliverySessionFactory.createAttended()
    val actionPlanId = UUID.randomUUID()
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(session)

    assertThrows(ResponseStatusException::class.java) {
      deliverySessionsService.recordBehaviour(user, actionPlanId, 1, "bad", false)
    }
  }

  @Test
  fun `session feedback can be submitted when session not attended`() {
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(
      session
    )
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val user = createActor()
    deliverySessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.NO, "")
    deliverySessionsService.submitSessionFeedback(actionPlanId, 1, user)

    verify(deliverySessionRepository, atLeastOnce()).save(session)
    verify(actionPlanAppointmentEventPublisher).attendanceRecordedEvent(session)
    verify(actionPlanAppointmentEventPublisher).sessionFeedbackRecordedEvent(session)
  }

  @Test
  fun `session feedback can be submitted when session is attended and there is no behaviour feedback`() {
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, 1)).thenReturn(
      session
    )
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val user = createActor()
    deliverySessionsService.recordAppointmentAttendance(user, actionPlanId, 1, Attended.YES, "")
    deliverySessionsService.submitSessionFeedback(actionPlanId, 1, user)

    verify(deliverySessionRepository, atLeastOnce()).save(session)
    verify(actionPlanAppointmentEventPublisher).attendanceRecordedEvent(session)
    verify(actionPlanAppointmentEventPublisher).sessionFeedbackRecordedEvent(session)
  }

  @Test
  fun `makes a booking with delius office location`() {
    val session = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = session.sessionNumber
    val referral = session.referral
    val createdByUser = session.referral.createdBy
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
    whenever(deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)).thenReturn(
      session
    )
    whenever(authUserRepository.save(createdByUser)).thenReturn(createdByUser)
    whenever(deliverySessionRepository.save(any())).thenReturn(session)

    val updatedSession = deliverySessionsService.updateSessionAppointment(
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

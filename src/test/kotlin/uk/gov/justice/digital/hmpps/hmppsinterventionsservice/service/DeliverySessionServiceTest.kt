package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.eq
import org.mockito.kotlin.isNotNull
import org.mockito.kotlin.isNull
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DeliverySession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DeliverySessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

@RepositoryTest
class DeliverySessionServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val appointmentRepository: AppointmentRepository,
  val deliverySessionRepository: DeliverySessionRepository,
  val actionPlanRepository: ActionPlanRepository,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  appointmentDeliveryRepository: AppointmentDeliveryRepository,
) {
  private val actionPlanAppointmentEventPublisher = mock<ActionPlanAppointmentEventPublisher>()
  private val communityAPIBookingService = mock<CommunityAPIBookingService>()
  private val appointmentEventPublisher = mock<AppointmentEventPublisher>()
  private val appointmentService = AppointmentService(
    appointmentRepository, communityAPIBookingService, appointmentDeliveryRepository, authUserRepository, appointmentEventPublisher, referralRepository
  )

  private val deliverySessionService = DeliverySessionService(
    deliverySessionRepository, actionPlanRepository, authUserRepository,
    actionPlanAppointmentEventPublisher,
    communityAPIBookingService,
    appointmentService, appointmentRepository,
  )

  private val referralFactory = ReferralFactory(entityManager)
  private val userFactory = AuthUserFactory(entityManager)
  private val deliverySessionFactory = DeliverySessionFactory(entityManager)
  private val actionPlanFactory = ActionPlanFactory(entityManager)

  val defaultAppointmentTime = OffsetDateTime.now().plusDays(1)
  val defaultDuration = 1
  lateinit var defaultUser: AuthUser

  @BeforeEach
  fun beforeEach() {
    defaultUser = userFactory.create()
  }

  @Nested
  inner class SchedulingNewDeliverySessionAppointment {

    @Test
    fun `can schedule new appointment on empty session`() {
      val session = deliverySessionFactory.createUnscheduled()
      val updatedSession = deliverySessionService.scheduleNewDeliverySessionAppointment(session.referral.id, session.sessionNumber, defaultAppointmentTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)

      verify(communityAPIBookingService).book(eq(session.referral), isNull(), eq(defaultAppointmentTime), eq(defaultDuration), eq(AppointmentType.SERVICE_DELIVERY), anyOrNull(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(1)
      val appointment = updatedSession.appointments.first()
      assertThat(appointment.appointmentTime).isEqualTo(defaultAppointmentTime)
      assertThat(appointment.durationInMinutes).isEqualTo(defaultDuration)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
    }

    @Test
    fun `can schedule new appointment on already populated session`() {
      val session = deliverySessionFactory.createAttended()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.plusHours(1)
      val updatedSession = deliverySessionService.scheduleNewDeliverySessionAppointment(session.referral.id, session.sessionNumber, newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)

      verify(communityAPIBookingService).book(any(), isNotNull(), any(), any(), any(), anyOrNull(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(2)

      val appointment = updatedSession.currentAppointment!!
      assertThat(appointment.appointmentTime).isEqualTo(newTime)
      assertThat(appointment.durationInMinutes).isEqualTo(defaultDuration)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
    }

    @Test
    fun `can schedule new appointment with appointment feedback`() {
      val session = deliverySessionFactory.createUnscheduled()
      val pastDate = OffsetDateTime.now().minusDays(1)

      whenever(actionPlanAppointmentEventPublisher.sessionFeedbackRecordedEvent(any())).doAnswer {
        val session = it.getArgument<DeliverySession>(0)
        assertThat(session.currentAppointment?.appointmentFeedbackSubmittedAt).isNotNull()
        assertThat(session.currentAppointment?.appointmentFeedbackSubmittedBy).isNotNull()
        assertThat(session.currentAppointment?.attended).isEqualTo(Attended.YES)
        assertThat(session.currentAppointment?.additionalAttendanceInformation).isEqualTo("additionalAttendanceInformation")
        assertThat(session.currentAppointment?.notifyPPOfAttendanceBehaviour).isEqualTo(false)
        assertThat(session.currentAppointment?.attendanceBehaviour).isEqualTo("behaviourDescription")
        null
      }

      val updatedSession = deliverySessionService.scheduleNewDeliverySessionAppointment(
        session.referral.id, session.sessionNumber, pastDate, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE,
        attended = Attended.YES, additionalAttendanceInformation = "additionalAttendanceInformation", notifyProbationPractitioner = false, behaviourDescription = "behaviourDescription"
      )

      verify(communityAPIBookingService).book(eq(session.referral), isNull(), eq(pastDate), eq(defaultDuration), eq(AppointmentType.SERVICE_DELIVERY), anyOrNull(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(1)
      val appointment = updatedSession.appointments.first()
      assertThat(appointment.appointmentTime).isEqualTo(pastDate)
      assertThat(appointment.durationInMinutes).isEqualTo(defaultDuration)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
      assertThat(appointment.attended).isEqualTo(Attended.YES)
      assertThat(appointment.additionalAttendanceInformation).isEqualTo("additionalAttendanceInformation")
      assertThat(appointment.notifyPPOfAttendanceBehaviour).isEqualTo(false)
      assertThat(appointment.attendanceBehaviour).isEqualTo("behaviourDescription")
      assertThat(appointment.attendanceSubmittedAt).isNotNull()
      assertThat(appointment.attendanceSubmittedBy).isEqualTo(defaultUser)
      assertThat(appointment.appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.PHONE_CALL)
      assertThat(appointment.appointmentDelivery?.appointmentSessionType).isEqualTo(AppointmentSessionType.ONE_TO_ONE)
    }

    @Test
    fun `scheduling appointment with a date in the past and not providing appointment feedback throws exception`() {
      val session = deliverySessionFactory.createUnscheduled()
      val pastDate = OffsetDateTime.now().minusDays(1)
      val error = assertThrows<IllegalArgumentException> {
        deliverySessionService.scheduleNewDeliverySessionAppointment(session.referral.id, session.sessionNumber, pastDate, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("Appointment feedback must be provided for appointments in the past.")
    }

    @Test
    fun `scheduling appointment on unknown session number throws exception`() {
      val referral = referralFactory.createSent()
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.scheduleNewDeliverySessionAppointment(referral.id, 1, defaultAppointmentTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("Session not found for referral")
    }

    @Test
    fun `scheduling appointment before existing appointment for session throws exception`() {
      val session = deliverySessionFactory.createAttended()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.minusHours(1)
      val error = assertThrows<EntityExistsException> {
        deliverySessionService.scheduleNewDeliverySessionAppointment(session.referral.id, session.sessionNumber, newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't schedule new appointment for session; new appointment occurs before previously scheduled appointment for session")
    }

    @Test
    fun `scheduling appointment when existing appointment has no feedback throws exception`() {
      val session = deliverySessionFactory.createScheduled()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.plusHours(1)
      val error = assertThrows<ValidationError> {
        deliverySessionService.scheduleNewDeliverySessionAppointment(session.referral.id, session.sessionNumber, newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't schedule new appointment for session; latest appointment has no feedback delivered")
    }
  }

  @Nested
  inner class ReschedulingDeliverySessionAppointment {
    @Test
    fun `can reschedule appointment`() {
      val session = deliverySessionFactory.createScheduled()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.plusHours(1)
      val updatedSession = deliverySessionService.rescheduleDeliverySessionAppointment(session.referral.id, session.sessionNumber, existingAppointment.id, newTime, 2, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)

      verify(communityAPIBookingService).book(any(), isNotNull(), any(), any(), any(), anyOrNull(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(1)

      val appointment = updatedSession.currentAppointment!!
      assertThat(appointment.appointmentTime).isEqualTo(newTime)
      assertThat(appointment.durationInMinutes).isEqualTo(2)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
    }

    @Test
    fun `can reschedule an appointment with a past time and with appointment feedback`() {
      val session = deliverySessionFactory.createScheduled()
      val existingAppointment = session.currentAppointment!!
      val pastDate = OffsetDateTime.now().minusDays(1)

      whenever(actionPlanAppointmentEventPublisher.sessionFeedbackRecordedEvent(any())).doAnswer {
        val session = it.getArgument<DeliverySession>(0)
        assertThat(session.currentAppointment?.appointmentFeedbackSubmittedAt).isNotNull()
        assertThat(session.currentAppointment?.appointmentFeedbackSubmittedBy).isNotNull()
        assertThat(session.currentAppointment?.attended).isEqualTo(Attended.YES)
        assertThat(session.currentAppointment?.additionalAttendanceInformation).isEqualTo("additionalAttendanceInformation")
        assertThat(session.currentAppointment?.notifyPPOfAttendanceBehaviour).isEqualTo(false)
        assertThat(session.currentAppointment?.attendanceBehaviour).isEqualTo("behaviourDescription")
        null
      }

      val updatedSession = deliverySessionService.rescheduleDeliverySessionAppointment(
        session.referral.id, session.sessionNumber, existingAppointment.id, pastDate, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE,
        attended = Attended.YES, additionalAttendanceInformation = "additionalAttendanceInformation", notifyProbationPractitioner = false, behaviourDescription = "behaviourDescription"
      )

      verify(communityAPIBookingService).book(any(), isNotNull(), any(), any(), any(), anyOrNull(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(1)
      val appointment = updatedSession.appointments.first()
      assertThat(appointment.appointmentTime).isEqualTo(pastDate)
      assertThat(appointment.durationInMinutes).isEqualTo(defaultDuration)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
      assertThat(appointment.attended).isEqualTo(Attended.YES)
      assertThat(appointment.additionalAttendanceInformation).isEqualTo("additionalAttendanceInformation")
      assertThat(appointment.notifyPPOfAttendanceBehaviour).isEqualTo(false)
      assertThat(appointment.attendanceBehaviour).isEqualTo("behaviourDescription")
      assertThat(appointment.attendanceSubmittedAt).isNotNull()
      assertThat(appointment.attendanceSubmittedBy).isEqualTo(defaultUser)
      assertThat(appointment.appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.PHONE_CALL)
      assertThat(appointment.appointmentDelivery?.appointmentSessionType).isEqualTo(AppointmentSessionType.ONE_TO_ONE)
    }

    @Test
    fun `rescheduling appointment with a date in the past and not providing appointment feedback throws exception`() {
      val session = deliverySessionFactory.createScheduled()
      val existingAppointment = session.currentAppointment!!
      val pastDate = OffsetDateTime.now().minusDays(1)
      val error = assertThrows<IllegalArgumentException> {
        deliverySessionService.rescheduleDeliverySessionAppointment(session.referral.id, session.sessionNumber, existingAppointment.id, pastDate, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("Appointment feedback must be provided for appointments in the past.")
    }

    @Test
    fun `rescheduling appointment on unknown session number throws exception`() {
      val referral = referralFactory.createSent()
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.rescheduleDeliverySessionAppointment(referral.id, 1, UUID.randomUUID(), defaultAppointmentTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("Session not found for referral")
    }

    @Test
    fun `rescheduling appointment on empty session throws exception`() {
      val session = deliverySessionFactory.createUnscheduled()
      val error = assertThrows<ValidationError> {
        deliverySessionService.rescheduleDeliverySessionAppointment(session.referral.id, session.sessionNumber, UUID.randomUUID(), defaultAppointmentTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't reschedule appointment for session; no appointment exists for session")
    }

    @Test
    fun `rescheduling appointment when no appointment exists throws exception`() {
      val session = deliverySessionFactory.createScheduled()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.minusHours(1)
      val error = assertThrows<ValidationError> {
        deliverySessionService.rescheduleDeliverySessionAppointment(session.referral.id, session.sessionNumber, UUID.randomUUID(), newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't reschedule appointment for session; no appointment exists for session")
    }

    @Test
    fun `rescheduling appointment when appointment has feedback throws exception`() {
      val session = deliverySessionFactory.createAttended()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.plusHours(1)
      val error = assertThrows<ValidationError> {
        deliverySessionService.rescheduleDeliverySessionAppointment(session.referral.id, session.sessionNumber, existingAppointment.id, newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't reschedule appointment for session; appointment feedback already supplied")
    }
  }

  @Nested
  inner class RecordAppointmentAttendance {
    @Test
    fun `can record attendance`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referral = deliverySession.referral
      val appointment = deliverySession.currentAppointment!!
      val pair = deliverySessionService.recordAppointmentAttendance(referral.id, appointment.id, defaultUser, Attended.YES, "additionalInformation")
      assertThat(pair.first).isEqualTo(deliverySession)
      assertThat(pair.second).isEqualTo(appointment)
    }

    @Test
    fun `expect failure when no referral exists`() {
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.recordAppointmentAttendance(UUID.randomUUID(), UUID.randomUUID(), defaultUser, Attended.YES, "additionalInformation")
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no session exists`() {
      val referral = referralFactory.createSent()
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.recordAppointmentAttendance(referral.id, UUID.randomUUID(), defaultUser, Attended.YES, "additionalInformation")
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no appointment exists`() {
      val deliverySession = deliverySessionFactory.createUnscheduled()
      val referral = deliverySession.referral
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.recordAppointmentAttendance(referral.id, UUID.randomUUID(), defaultUser, Attended.YES, "additionalInformation")
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no matching appointment exists`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referral = deliverySession.referral
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.recordAppointmentAttendance(referral.id, UUID.randomUUID(), defaultUser, Attended.YES, "additionalInformation")
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }
  }

  @Nested
  inner class RecordAppointmentBehaviour {
    @Test
    fun `can record behaviour`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referral = deliverySession.referral
      val appointment = deliverySession.currentAppointment!!
      val pair = deliverySessionService.recordAppointmentBehaviour(referral.id, appointment.id, defaultUser, "good", false)
      assertThat(pair.first).isEqualTo(deliverySession)
      assertThat(pair.second).isEqualTo(appointment)
    }

    @Test
    fun `expect failure when no referral exists`() {
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.recordAppointmentBehaviour(UUID.randomUUID(), UUID.randomUUID(), defaultUser, "good", false)
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no session exists`() {
      val referral = referralFactory.createSent()
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.recordAppointmentBehaviour(referral.id, UUID.randomUUID(), defaultUser, "good", false)
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no appointment exists`() {
      val deliverySession = deliverySessionFactory.createUnscheduled()
      val referral = deliverySession.referral
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.recordAppointmentBehaviour(referral.id, UUID.randomUUID(), defaultUser, "good", false)
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no matching appointment exists`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referral = deliverySession.referral
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.recordAppointmentBehaviour(referral.id, UUID.randomUUID(), defaultUser, "good", false)
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }
  }

  @Nested
  inner class SubmitSessionFeedback {
    @Test
    fun `can submit feedback`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referral = deliverySession.referral
      val appointment = deliverySession.currentAppointment!!
      appointment.attended = Attended.NO
      appointment.attendanceSubmittedAt = OffsetDateTime.now()
      appointmentRepository.save(appointment)
      val pair = deliverySessionService.submitSessionFeedback(referral.id, appointment.id, defaultUser)
      assertThat(pair.first).isEqualTo(deliverySession)
      assertThat(pair.second).isEqualTo(appointment)
    }

    @Test
    fun `expect failure when no referral exists`() {
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.submitSessionFeedback(UUID.randomUUID(), UUID.randomUUID(), defaultUser)
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no session exists`() {
      val referral = referralFactory.createSent()
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.submitSessionFeedback(referral.id, UUID.randomUUID(), defaultUser)
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no appointment exists`() {
      val deliverySession = deliverySessionFactory.createUnscheduled()
      val referral = deliverySession.referral
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.submitSessionFeedback(referral.id, UUID.randomUUID(), defaultUser)
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }

    @Test
    fun `expect failure when no matching appointment exists`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referral = deliverySession.referral
      val error = assertThrows<EntityNotFoundException> {
        deliverySessionService.submitSessionFeedback(referral.id, UUID.randomUUID(), defaultUser)
      }
      assertThat(error.message).contains("No Delivery Session Appointment found")
    }
  }

  @Nested
  inner class UpdateSessionAppointment {
    @Test
    fun `can create new delivery session appointment for a time in the past`() {
      val actionPlan = actionPlanFactory.createApproved(numberOfSessions = 1)
      val session = deliverySessionFactory.createUnscheduled(referral = actionPlan.referral)

      whenever(actionPlanAppointmentEventPublisher.sessionFeedbackRecordedEvent(any())).doAnswer {
        val session = it.getArgument<DeliverySession>(0)
        assertThat(session.currentAppointment?.appointmentFeedbackSubmittedAt).isNotNull()
        assertThat(session.currentAppointment?.appointmentFeedbackSubmittedBy).isNotNull()
        assertThat(session.currentAppointment?.attended).isEqualTo(Attended.YES)
        assertThat(session.currentAppointment?.additionalAttendanceInformation).isEqualTo("additionalAttendanceInformation")
        assertThat(session.currentAppointment?.notifyPPOfAttendanceBehaviour).isEqualTo(true)
        assertThat(session.currentAppointment?.attendanceBehaviour).isEqualTo("behaviourDescription")
        null
      }

      val updatedSession = deliverySessionService.updateSessionAppointment(
        actionPlan.id, session.sessionNumber, defaultAppointmentTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE,
        null,
        null,
        Attended.YES,
        "additionalAttendanceInformation",
        true,
        "behaviourDescription"
      )

      verify(communityAPIBookingService).book(eq(session.referral), isNull(), eq(defaultAppointmentTime), eq(defaultDuration), eq(AppointmentType.SERVICE_DELIVERY), anyOrNull(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(1)
      val appointment = updatedSession.appointments.first()
      assertThat(appointment.appointmentTime).isEqualTo(defaultAppointmentTime)
      assertThat(appointment.durationInMinutes).isEqualTo(defaultDuration)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
      assertThat(appointment.attended).isEqualTo(Attended.YES)
      assertThat(appointment.additionalAttendanceInformation).isEqualTo("additionalAttendanceInformation")
      assertThat(appointment.notifyPPOfAttendanceBehaviour).isEqualTo(true)
      assertThat(appointment.attendanceBehaviour).isEqualTo("behaviourDescription")
      assertThat(appointment.appointmentFeedbackSubmittedAt).isNotNull()
      assertThat(appointment.appointmentFeedbackSubmittedBy).isNotNull()
      assertThat(appointment.appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.PHONE_CALL)
      assertThat(appointment.appointmentDelivery?.appointmentSessionType).isEqualTo(AppointmentSessionType.ONE_TO_ONE)
    }

    @Test
    fun `can update existing scheduled delivery session appointment for a time in the past`() {
      val actionPlan = actionPlanFactory.createApproved(numberOfSessions = 1)
      val session = deliverySessionFactory.createScheduled(referral = actionPlan.referral)

      whenever(actionPlanAppointmentEventPublisher.sessionFeedbackRecordedEvent(any())).doAnswer {
        val session = it.getArgument<DeliverySession>(0)
        assertThat(session.currentAppointment?.appointmentFeedbackSubmittedAt).isNotNull()
        assertThat(session.currentAppointment?.appointmentFeedbackSubmittedBy).isNotNull()
        assertThat(session.currentAppointment?.attended).isEqualTo(Attended.YES)
        assertThat(session.currentAppointment?.additionalAttendanceInformation).isEqualTo("additionalAttendanceInformation")
        assertThat(session.currentAppointment?.notifyPPOfAttendanceBehaviour).isEqualTo(true)
        assertThat(session.currentAppointment?.attendanceBehaviour).isEqualTo("behaviourDescription")
        null
      }

      val updatedSession = deliverySessionService.updateSessionAppointment(
        actionPlan.id, session.sessionNumber, defaultAppointmentTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE,
        null,
        null,
        Attended.YES,
        "additionalAttendanceInformation",
        true,
        "behaviourDescription"
      )

      verify(communityAPIBookingService).book(eq(session.referral), isNotNull(), eq(defaultAppointmentTime), eq(defaultDuration), eq(AppointmentType.SERVICE_DELIVERY), anyOrNull(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(1)
      val appointment = updatedSession.appointments.first()
      assertThat(appointment.appointmentTime).isEqualTo(defaultAppointmentTime)
      assertThat(appointment.durationInMinutes).isEqualTo(defaultDuration)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
      assertThat(appointment.attended).isEqualTo(Attended.YES)
      assertThat(appointment.additionalAttendanceInformation).isEqualTo("additionalAttendanceInformation")
      assertThat(appointment.notifyPPOfAttendanceBehaviour).isEqualTo(true)
      assertThat(appointment.attendanceBehaviour).isEqualTo("behaviourDescription")
      assertThat(appointment.appointmentFeedbackSubmittedAt).isNotNull()
      assertThat(appointment.appointmentFeedbackSubmittedBy).isNotNull()
      assertThat(appointment.appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.PHONE_CALL)
      assertThat(appointment.appointmentDelivery?.appointmentSessionType).isEqualTo(AppointmentSessionType.ONE_TO_ONE)
    }
  }
}
package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.isNotNull
import com.nhaarman.mockitokotlin2.isNull
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DeliverySessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityNotFoundException

@RepositoryTest
class DeliverySessionServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val appointmentRepository: AppointmentRepository,
  val deliverySessionRepository: DeliverySessionRepository,
  val actionPlanRepository: ActionPlanRepository,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
) {
  private val actionPlanAppointmentEventPublisher = mock<ActionPlanAppointmentEventPublisher>()
  private val communityAPIBookingService = mock<CommunityAPIBookingService>()
  private val appointmentService = mock<AppointmentService>()

  private val deliverySessionService = DeliverySessionService(
    deliverySessionRepository, actionPlanRepository, authUserRepository,
    actionPlanAppointmentEventPublisher,
    communityAPIBookingService,
    appointmentService, appointmentRepository,
  )

  private val referralFactory = ReferralFactory(entityManager)
  private val userFactory = AuthUserFactory(entityManager)
  private val deliverySessionFactory = DeliverySessionFactory(entityManager)

  val defaultAppointmentTime = OffsetDateTime.now()
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

      verify(communityAPIBookingService).book(eq(session.referral), isNull(), eq(defaultAppointmentTime), eq(defaultDuration), eq(AppointmentType.SERVICE_DELIVERY), anyOrNull())
      verify(appointmentService).createOrUpdateAppointmentDeliveryDetails(any(), eq(AppointmentDeliveryType.PHONE_CALL), eq(AppointmentSessionType.ONE_TO_ONE), anyOrNull(), anyOrNull())

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

      verify(communityAPIBookingService).book(any(), isNotNull(), any(), any(), any(), anyOrNull())
      verify(appointmentService).createOrUpdateAppointmentDeliveryDetails(any(), any(), any(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(2)

      val appointment = updatedSession.currentAppointment!!
      assertThat(appointment.appointmentTime).isEqualTo(newTime)
      assertThat(appointment.durationInMinutes).isEqualTo(defaultDuration)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
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
      val error = assertThrows<ResponseStatusException> {
        deliverySessionService.scheduleNewDeliverySessionAppointment(session.referral.id, session.sessionNumber, newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't schedule new appointment for session; new appointment occurs before previously scheduled appointment for session")
    }

    @Test
    fun `scheduling appointment when existing appointment has no feedback throws exception`() {
      val session = deliverySessionFactory.createScheduled()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.plusHours(1)
      val error = assertThrows<ResponseStatusException> {
        deliverySessionService.scheduleNewDeliverySessionAppointment(session.referral.id, session.sessionNumber, newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't schedule new appointment for session; existing appointment has no feedback delivered")
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

      verify(communityAPIBookingService).book(any(), isNotNull(), any(), any(), any(), anyOrNull())
      verify(appointmentService).createOrUpdateAppointmentDeliveryDetails(any(), any(), any(), anyOrNull(), anyOrNull())

      assertThat(updatedSession.appointments.size).isEqualTo(1)

      val appointment = updatedSession.currentAppointment!!
      assertThat(appointment.appointmentTime).isEqualTo(newTime)
      assertThat(appointment.durationInMinutes).isEqualTo(2)
      assertThat(appointment.createdBy).isEqualTo(defaultUser)
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
      val error = assertThrows<ResponseStatusException> {
        deliverySessionService.rescheduleDeliverySessionAppointment(session.referral.id, session.sessionNumber, UUID.randomUUID(), defaultAppointmentTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't reschedule appointment for session; no appointment exists for session")
    }

    @Test
    fun `rescheduling appointment when no appointment exists throws exception`() {
      val session = deliverySessionFactory.createScheduled()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.minusHours(1)
      val error = assertThrows<ResponseStatusException> {
        deliverySessionService.rescheduleDeliverySessionAppointment(session.referral.id, session.sessionNumber, UUID.randomUUID(), newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't reschedule appointment for session; no appointment exists for session")
    }

    @Test
    fun `rescheduling appointment when appointment has feedback throws exception`() {
      val session = deliverySessionFactory.createAttended()
      val existingAppointment = session.currentAppointment!!
      val newTime = existingAppointment.appointmentTime.plusHours(1)
      val error = assertThrows<ResponseStatusException> {
        deliverySessionService.rescheduleDeliverySessionAppointment(session.referral.id, session.sessionNumber, existingAppointment.id, newTime, defaultDuration, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE)
      }
      assertThat(error.message).contains("can't reschedule appointment for session; appointment feedback already supplied")
    }
  }
}

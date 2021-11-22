package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ReferralAccessChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DeliverySessionAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DeliverySessionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.DeliverySessionService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator.AppointmentValidator
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityNotFoundException

internal class DeliverySessionControllerTest {
  private val sessionsService = mock<DeliverySessionService>()
  private val locationMapper = mock<LocationMapper>()
  private val appointmentValidator = mock<AppointmentValidator>()
  private val authUserRepository = mock<AuthUserRepository>()
  private val actionPlanService = mock<ActionPlanService>()
  private val userMapper = UserMapper(authUserRepository)
  private val referralService = mock<ReferralService>()
  private val referralAccessChecker = mock<ReferralAccessChecker>()

  private val sessionsController = DeliverySessionController(actionPlanService, sessionsService, locationMapper, userMapper, appointmentValidator, referralAccessChecker, referralService)
  private val actionPlanFactory = ActionPlanFactory()
  private val deliverySessionFactory = DeliverySessionFactory()
  private val jwtTokenFactory = JwtTokenFactory()
  private val authUserFactory = AuthUserFactory()

  @Test
  fun `updates a session`() {
    val user = authUserFactory.create()
    val userToken = jwtTokenFactory.create(user)
    val deliverySession = deliverySessionFactory.createScheduled(createdBy = user)
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = deliverySession.sessionNumber

    val updateAppointmentDTO = UpdateAppointmentDTO(OffsetDateTime.now(), 10, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE, null, null)

    whenever(
      sessionsService.updateSessionAppointment(
        actionPlanId,
        sessionNumber,
        updateAppointmentDTO.appointmentTime,
        updateAppointmentDTO.durationInMinutes,
        user,
        AppointmentDeliveryType.PHONE_CALL,
        AppointmentSessionType.ONE_TO_ONE,
        null,
        null
      )
    ).thenReturn(deliverySession)

    val sessionResponse = sessionsController.updateSessionAppointment(actionPlanId, sessionNumber, updateAppointmentDTO, userToken)

    assertThat(sessionResponse).isEqualTo(DeliverySessionDTO.from(deliverySession))
  }

  @Nested
  inner class GetSession {
    @Test
    fun `gets a session`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val sessionNumber = deliverySession.sessionNumber
      val actionPlanId = UUID.randomUUID()
      val actionPlan = actionPlanFactory.create(referral = deliverySession.referral)

      whenever(actionPlanService.getActionPlan(actionPlanId)).thenReturn(actionPlan)
      whenever(sessionsService.getSession(deliverySession.referral.id, sessionNumber)).thenReturn(deliverySession)

      val sessionResponse = sessionsController.getSessionForActionPlanId(actionPlanId, sessionNumber)

      assertThat(sessionResponse).isEqualTo(DeliverySessionDTO.from(deliverySession))
    }
  }

  @Nested
  inner class GetDeliverySessionAppointmentForReferral {
    val user = authUserFactory.create()
    val userToken = jwtTokenFactory.create(user)

    @Test
    fun `can get a session by referralId and appointmentId`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referralId = deliverySession.referral.id
      val appointmentId = deliverySession.appointments.first().id

      whenever(referralService.getSentReferral(referralId)).thenReturn(deliverySession.referral)
      whenever(sessionsService.getSessions(referralId)).thenReturn(listOf(deliverySession))

      val sessionResponse = sessionsController.getDeliverySessionAppointment(referralId, appointmentId, userToken)

      assertThat(sessionResponse).isEqualTo(DeliverySessionAppointmentDTO.from(deliverySession.sessionNumber, deliverySession.appointments.first()))
    }

    @Test
    fun `expect bad request when referral does not exist`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referralId = UUID.randomUUID()
      val appointmentId = deliverySession.id

      whenever(referralService.getSentReferral(referralId)).thenReturn(null)

      val e = assertThrows<ResponseStatusException> { sessionsController.getDeliverySessionAppointment(referralId, appointmentId, userToken) }
      assertThat(e.reason).contains("sent referral not found")
    }

    @Test
    fun `expect bad request when appointment does not exist on referral`() {
      val deliverySession = deliverySessionFactory.createScheduled()
      val referralId = deliverySession.referral.id
      val otherDeliverySession = deliverySessionFactory.createScheduled()
      val appointmentId = otherDeliverySession.appointments.first().id

      whenever(referralService.getSentReferral(referralId)).thenReturn(deliverySession.referral)
      whenever(sessionsService.getSessions(referralId)).thenReturn(listOf(deliverySession))

      val e = assertThrows<EntityNotFoundException> { sessionsController.getDeliverySessionAppointment(referralId, appointmentId, userToken) }
      assertThat(e.message).contains("Delivery session appointment not found")
    }
  }

  @Test
  fun `gets a list of sessions`() {
    val deliverySession = deliverySessionFactory.createScheduled()
    val actionPlanId = UUID.randomUUID()
    val actionPlan = actionPlanFactory.create(referral = deliverySession.referral)

    whenever(actionPlanService.getActionPlan(actionPlanId)).thenReturn(actionPlan)
    whenever(sessionsService.getSessions(deliverySession.referral.id)).thenReturn(listOf(deliverySession))

    val sessionsResponse = sessionsController.getSessionsForActionPlan(actionPlanId)

    assertThat(sessionsResponse.size).isEqualTo(1)
    assertThat(sessionsResponse.first()).isEqualTo(DeliverySessionDTO.from(deliverySession))
  }

  @Test
  fun `updates session appointment with attendance details`() {
    val user = authUserFactory.create()
    val userToken = jwtTokenFactory.create(user)
    val update = UpdateAppointmentAttendanceDTO(Attended.YES, "more info")
    val actionPlan = actionPlanFactory.create()
    val sessionNumber = 1

    val updatedSession = deliverySessionFactory.createAttended(
      sessionNumber = sessionNumber,
      attended = Attended.YES,
      additionalAttendanceInformation = "more info"
    )

    whenever(
      sessionsService.recordAppointmentAttendance(
        user, actionPlan.id, sessionNumber, update.attended,
        update.additionalAttendanceInformation
      )
    ).thenReturn(updatedSession)

    val sessionResponse = sessionsController.recordAttendance(actionPlan.id, sessionNumber, update, userToken)

    assertThat(sessionResponse.sessionFeedback.attendance.additionalAttendanceInformation).isEqualTo("more info")
  }
}

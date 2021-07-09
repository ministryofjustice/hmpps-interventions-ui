package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanSessionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanSessionsService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanSessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator.AppointmentValidator
import java.time.OffsetDateTime

internal class ActionPlanSessionControllerTest {
  private val sessionsService = mock<ActionPlanSessionsService>()
  private val locationMapper = mock<LocationMapper>()
  private val appointmentValidator = mock<AppointmentValidator>()
  private val userMapper = UserMapper()

  private val sessionsController = ActionPlanSessionController(sessionsService, locationMapper, userMapper, appointmentValidator)
  private val actionPlanFactory = ActionPlanFactory()
  private val actionPlanSessionFactory = ActionPlanSessionFactory()
  private val jwtTokenFactory = JwtTokenFactory()
  private val authUserFactory = AuthUserFactory()

  @Test
  fun `updates a session`() {
    val user = authUserFactory.create()
    val userToken = jwtTokenFactory.create(user)
    val actionPlanSession = actionPlanSessionFactory.createScheduled(createdBy = user)
    val actionPlanId = actionPlanSession.actionPlan.id
    val sessionNumber = actionPlanSession.sessionNumber

    val updateAppointmentDTO = UpdateAppointmentDTO(OffsetDateTime.now(), 10, AppointmentDeliveryType.PHONE_CALL, null)

    whenever(
      sessionsService.updateSessionAppointment(
        actionPlanId,
        sessionNumber,
        updateAppointmentDTO.appointmentTime,
        updateAppointmentDTO.durationInMinutes,
        user,
        AppointmentDeliveryType.PHONE_CALL,
        null
      )
    ).thenReturn(actionPlanSession)

    val sessionResponse = sessionsController.updateSessionAppointment(actionPlanId, sessionNumber, updateAppointmentDTO, userToken)

    assertThat(sessionResponse).isEqualTo(ActionPlanSessionDTO.from(actionPlanSession))
  }

  @Nested
  inner class GetSession {
    @Test
    fun `gets a session`() {
      val actionPlanSession = actionPlanSessionFactory.createScheduled()
      val sessionNumber = actionPlanSession.sessionNumber
      val actionPlanId = actionPlanSession.actionPlan.id

      whenever(sessionsService.getSession(actionPlanId, sessionNumber)).thenReturn(actionPlanSession)

      val sessionResponse = sessionsController.getSession(actionPlanId, sessionNumber)

      assertThat(sessionResponse).isEqualTo(ActionPlanSessionDTO.from(actionPlanSession))
    }
  }

  @Test
  fun `gets a list of sessions`() {
    val actionPlanSession = actionPlanSessionFactory.createScheduled()
    val actionPlanId = actionPlanSession.actionPlan.id

    whenever(sessionsService.getSessions(actionPlanId)).thenReturn(listOf(actionPlanSession))

    val sessionsResponse = sessionsController.getSessions(actionPlanId)

    assertThat(sessionsResponse.size).isEqualTo(1)
    assertThat(sessionsResponse.first()).isEqualTo(ActionPlanSessionDTO.from(actionPlanSession))
  }

  @Test
  fun `updates session appointment with attendance details`() {
    val user = authUserFactory.create()
    val userToken = jwtTokenFactory.create(user)
    val update = UpdateAppointmentAttendanceDTO(Attended.YES, "more info")
    val actionPlan = actionPlanFactory.create()
    val sessionNumber = 1

    val updatedSession = actionPlanSessionFactory.createAttended(
      actionPlan = actionPlan,
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

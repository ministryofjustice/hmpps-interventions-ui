package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.RecordAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import java.util.UUID

class AppointmentControllerTest {
  private val appointmentService = mock<AppointmentService>()

  private val appointmentFactory = AppointmentFactory()
  private val authUserFactory = AuthUserFactory()
  private val userMapper = mock<UserMapper>()
  private val tokenFactory = JwtTokenFactory()

  private val appointmentController = AppointmentController(appointmentService, userMapper)

  @Test
  fun `can record appointment behaviour`() {
    val appointmentId = UUID.randomUUID()
    val behaviourDescription = "description"
    val notifyProbationPractitioner = true
    val submittedBy = authUserFactory.create()
    val token = tokenFactory.create()

    val update = RecordAppointmentBehaviourDTO(behaviourDescription, notifyProbationPractitioner)

    val appointment = appointmentFactory.create()
    whenever(appointmentService.recordBehaviour(any(), any(), any(), any())).thenReturn(appointment)
    whenever(userMapper.fromToken(token)).thenReturn(submittedBy)

    val result = appointmentController.recordAppointmentBehaviour(appointmentId, update, token)

    assertThat(result).isNotNull
  }

  @Test
  fun `can record appointment attendance`() {
    val appointmentId = UUID.randomUUID()
    val attended = Attended.YES
    val additionalAttendanceInformation = "information"
    val submittedBy = authUserFactory.create()
    val token = tokenFactory.create()
    val update = UpdateAppointmentAttendanceDTO(attended, additionalAttendanceInformation)
    val appointment = appointmentFactory.create()

    whenever(appointmentService.recordAppointmentAttendance(any(), any(), any(), any())).thenReturn(appointment)
    whenever(userMapper.fromToken(token)).thenReturn(submittedBy)

    val result = appointmentController.recordAttendance(appointmentId, update, token)

    assertThat(result).isNotNull
  }

  @Test
  fun `can submit appointment feedback`() {
    val appointmentId = UUID.randomUUID()
    val submittedBy = authUserFactory.create()
    val token = tokenFactory.create()
    val appointment = appointmentFactory.create()

    whenever(appointmentService.submitSessionFeedback(any(), any())).thenReturn(appointment)
    whenever(userMapper.fromToken(token)).thenReturn(submittedBy)

    val result = appointmentController.submitFeedback(appointmentId, token)

    assertThat(result).isNotNull
  }
}

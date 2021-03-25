package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.NewAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SessionAttendance
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentsService
import java.net.URI
import java.time.OffsetDateTime
import java.util.UUID

internal class AppointmentsControllerTest {

  private val jwtAuthUserMapper = mock<JwtAuthUserMapper>()
  private val appointmentsService = mock<AppointmentsService>()
  private val locationMapper = mock<LocationMapper>()

  private val appointmentsController = AppointmentsController(jwtAuthUserMapper, appointmentsService, locationMapper)

  @Test
  fun `saves an appointment`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    val newAppointmentDTO = NewAppointmentDTO(1, OffsetDateTime.now(), 10)
    val jwtAuthenticationToken = JwtAuthenticationToken(mock())

    val uriComponents = UriComponentsBuilder.fromUri(URI.create("/1234")).build()

    whenever(jwtAuthUserMapper.map(jwtAuthenticationToken)).thenReturn(createdByUser)
    whenever(
      appointmentsService.createAppointment(
        actionPlan.id,
        newAppointmentDTO.sessionNumber,
        newAppointmentDTO.appointmentTime,
        newAppointmentDTO.durationInMinutes,
        createdByUser
      )
    ).thenReturn(actionPlanAppointment)
    whenever(
      locationMapper.mapToCurrentRequestBasePath(
        "/action-plan/{id}/appointment/{sessionNumber}",
        actionPlan.id,
        newAppointmentDTO.sessionNumber
      )
    ).thenReturn(uriComponents)

    val appointmentResponse = appointmentsController.createAppointment(actionPlan.id, newAppointmentDTO, jwtAuthenticationToken)

    assertThat(appointmentResponse.let { it.body }).isEqualTo(ActionPlanAppointmentDTO.from(actionPlanAppointment))
    assertThat(appointmentResponse.let { it.headers["location"] }).isEqualTo(listOf("/1234"))
  }

  @Test
  fun `updates an appointment`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)
    val sessionNumber = 1

    val updateAppointmentDTO = UpdateAppointmentDTO(OffsetDateTime.now(), 10)

    whenever(
      appointmentsService.updateAppointment(
        actionPlan.id,
        sessionNumber,
        updateAppointmentDTO.appointmentTime,
        updateAppointmentDTO.durationInMinutes
      )
    ).thenReturn(actionPlanAppointment)

    val appointmentResponse = appointmentsController.updateAppointment(actionPlan.id, sessionNumber, updateAppointmentDTO)

    assertThat(appointmentResponse).isEqualTo(ActionPlanAppointmentDTO.from(actionPlanAppointment))
  }

  @Test
  fun `gets an appointment`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)
    val sessionNumber = 1

    whenever(appointmentsService.getAppointment(actionPlan.id, sessionNumber)).thenReturn(actionPlanAppointment)

    val appointmentResponse = appointmentsController.getAppointment(actionPlan.id, sessionNumber)

    assertThat(appointmentResponse).isEqualTo(ActionPlanAppointmentDTO.from(actionPlanAppointment))
  }

  @Test
  fun `gets a list of appointment`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(appointmentsService.getAppointments(actionPlan.id)).thenReturn(listOf(actionPlanAppointment))

    val appointmentsResponse = appointmentsController.getAppointments(actionPlan.id)

    assertThat(appointmentsResponse.size).isEqualTo(1)
    assertThat(appointmentsResponse.first()).isEqualTo(ActionPlanAppointmentDTO.from(actionPlanAppointment))
  }

  @Test
  fun `updates appointment with attendance details`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val update = UpdateAppointmentAttendanceDTO(SessionAttendance.YES, "more info")
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()

    val updatedAppointment = SampleData.sampleActionPlanAppointment(
      actionPlan = actionPlan, createdBy = createdByUser,
      attended = SessionAttendance.YES, additionalAttendanceInformation = "more info"
    )

    whenever(
      appointmentsService.updateAppointmentWithAttendance(
        actionPlanId, sessionNumber, update.attended,
        update.additionalAttendanceInformation
      )
    ).thenReturn(updatedAppointment)

    val appointmentResponse = appointmentsController.updateAppointmentWithAttendance(actionPlanId, sessionNumber, update)

    assertThat(appointmentResponse).isNotNull
  }
}

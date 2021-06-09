package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanSessionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanSessionsService
import java.time.OffsetDateTime
import java.util.UUID

internal class ActionPlanSessionControllerTest {
  private val appointmentsService = mock<ActionPlanSessionsService>()
  private val locationMapper = mock<LocationMapper>()

  private val appointmentsController = ActionPlanSessionController(appointmentsService, locationMapper)

  @Test
  fun `updates a session`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)
    val sessionNumber = 1

    val updateAppointmentDTO = UpdateAppointmentDTO(OffsetDateTime.now(), 10)

    whenever(
      appointmentsService.updateSession(
        actionPlan.id,
        sessionNumber,
        updateAppointmentDTO.appointmentTime,
        updateAppointmentDTO.durationInMinutes
      )
    ).thenReturn(actionPlanSession)

    val appointmentResponse = appointmentsController.updateSession(actionPlan.id, sessionNumber, updateAppointmentDTO)

    assertThat(appointmentResponse).isEqualTo(ActionPlanSessionDTO.from(actionPlanSession))
  }

  @Test
  fun `gets an appointment`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)
    val sessionNumber = 1

    whenever(appointmentsService.getSession(actionPlan.id, sessionNumber)).thenReturn(actionPlanSession)

    val appointmentResponse = appointmentsController.getSession(actionPlan.id, sessionNumber)

    assertThat(appointmentResponse).isEqualTo(ActionPlanSessionDTO.from(actionPlanSession))
  }

  @Test
  fun `gets a list of appointment`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanSession = SampleData.sampleActionPlanSession(actionPlan = actionPlan, createdBy = createdByUser)

    whenever(appointmentsService.getSessions(actionPlan.id)).thenReturn(listOf(actionPlanSession))

    val appointmentsResponse = appointmentsController.getSessions(actionPlan.id)

    assertThat(appointmentsResponse.size).isEqualTo(1)
    assertThat(appointmentsResponse.first()).isEqualTo(ActionPlanSessionDTO.from(actionPlanSession))
  }

  @Test
  fun `updates appointment with attendance details`() {
    val actionPlanId = UUID.randomUUID()
    val sessionNumber = 1
    val update = UpdateAppointmentAttendanceDTO(Attended.YES, "more info")
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()

    val updatedAppointment = SampleData.sampleActionPlanSession(
      actionPlan = actionPlan, createdBy = createdByUser,
      attended = Attended.YES, additionalAttendanceInformation = "more info"
    )

    whenever(
      appointmentsService.recordAttendance(
        actionPlanId, sessionNumber, update.attended,
        update.additionalAttendanceInformation
      )
    ).thenReturn(updatedAppointment)

    val appointmentResponse = appointmentsController.recordAttendance(actionPlanId, sessionNumber, update)

    assertThat(appointmentResponse).isNotNull
  }
}

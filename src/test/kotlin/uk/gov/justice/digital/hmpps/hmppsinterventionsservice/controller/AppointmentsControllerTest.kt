package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentsService
import java.time.OffsetDateTime
import java.util.UUID

internal class AppointmentsControllerTest {
  private val appointmentsService = mock<AppointmentsService>()
  private val locationMapper = mock<LocationMapper>()

  private val appointmentsController = AppointmentsController(appointmentsService, locationMapper)

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
    val update = UpdateAppointmentAttendanceDTO(Attended.YES, "more info")
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()

    val updatedAppointment = SampleData.sampleActionPlanAppointment(
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

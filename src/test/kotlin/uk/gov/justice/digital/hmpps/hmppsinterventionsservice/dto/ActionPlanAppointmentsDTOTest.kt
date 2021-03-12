package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData

internal class ActionPlanAppointmentsDTOTest {

  @Test
  fun `Maps from an appointment`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    val appointmentDTO = ActionPlanAppointmentDTO.from(actionPlanAppointment)

    assertThat(appointmentDTO.id).isEqualTo(actionPlanAppointment.id)
    assertThat(appointmentDTO.sessionNumber).isEqualTo(actionPlanAppointment.sessionNumber)
    assertThat(appointmentDTO.appointmentTime).isEqualTo(actionPlanAppointment.appointmentTime)
    assertThat(appointmentDTO.durationInMinutes).isEqualTo(actionPlanAppointment.durationInMinutes)
    assertThat(appointmentDTO.createdAt).isEqualTo(actionPlanAppointment.createdAt)
    assertThat(appointmentDTO.createdBy.userId).isEqualTo(actionPlanAppointment.createdBy.id)
  }

  @Test
  fun `Maps from a list of appointments`() {
    val createdByUser = SampleData.sampleAuthUser()
    val actionPlan = SampleData.sampleActionPlan()
    val actionPlanAppointment = SampleData.sampleActionPlanAppointment(actionPlan = actionPlan, createdBy = createdByUser)

    val appointmentsDTO = ActionPlanAppointmentDTO.from(listOf(actionPlanAppointment))

    assertThat(appointmentsDTO.size).isEqualTo(1)
    assertThat(appointmentsDTO.first().id).isEqualTo(actionPlanAppointment.id)
    assertThat(appointmentsDTO.first().sessionNumber).isEqualTo(actionPlanAppointment.sessionNumber)
    assertThat(appointmentsDTO.first().appointmentTime).isEqualTo(actionPlanAppointment.appointmentTime)
    assertThat(appointmentsDTO.first().durationInMinutes).isEqualTo(actionPlanAppointment.durationInMinutes)
    assertThat(appointmentsDTO.first().createdAt).isEqualTo(actionPlanAppointment.createdAt)
    assertThat(appointmentsDTO.first().createdBy.userId).isEqualTo(actionPlanAppointment.createdBy.id)
  }
}

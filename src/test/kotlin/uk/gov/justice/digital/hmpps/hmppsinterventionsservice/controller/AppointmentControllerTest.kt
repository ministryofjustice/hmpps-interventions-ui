package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import java.util.UUID

class AppointmentControllerTest {
  private val appointmentService = mock<AppointmentService>()

  private val appointmentFactory = AppointmentFactory()

  private val appointmentController = AppointmentController(appointmentService)

  @Test
  fun `can record appointment behaviour`() {
    val appointmentId = UUID.randomUUID()
    val behaviourDescription = "description"
    val notifyProbationPractitioner = true
    val update = UpdateAppointmentBehaviourDTO(behaviourDescription, notifyProbationPractitioner)

    val appointment = appointmentFactory.create()
    whenever(appointmentService.recordBehaviour(any(), any(), any())).thenReturn(appointment)

    val result = appointmentController.recordAppointmentBehaviour(appointmentId, update)

    assertThat(result).isNotNull
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentService
import java.util.UUID

@RestController
class AppointmentController(
  private val appointmentService: AppointmentService,
) {

  @PutMapping("/appointment/{id}/record-behaviour")
  fun recordAppointmentBehaviour(
    @PathVariable id: UUID,
    @RequestBody update: UpdateAppointmentBehaviourDTO,
  ): AppointmentDTO {
    return AppointmentDTO.from(appointmentService.recordBehaviour(id, update.behaviourDescription, update.notifyProbationPractitioner))
  }
}

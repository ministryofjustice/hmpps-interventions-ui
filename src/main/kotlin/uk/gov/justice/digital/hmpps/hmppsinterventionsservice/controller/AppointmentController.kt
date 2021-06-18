package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.RecordAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentService
import java.util.UUID

@RestController
class AppointmentController(
  private val appointmentService: AppointmentService,
  val userMapper: UserMapper,
) {
  @PutMapping("/appointment/{id}/record-behaviour")
  fun recordAppointmentBehaviour(
    @PathVariable id: UUID,
    @RequestBody recordBehaviourDTO: RecordAppointmentBehaviourDTO,
    authentication: JwtAuthenticationToken,
  ): AppointmentDTO {
    val user = userMapper.fromToken(authentication)
    return AppointmentDTO.from(
      appointmentService.recordBehaviour(
        id, recordBehaviourDTO.behaviourDescription, recordBehaviourDTO.notifyProbationPractitioner, user
      )
    )
  }
}

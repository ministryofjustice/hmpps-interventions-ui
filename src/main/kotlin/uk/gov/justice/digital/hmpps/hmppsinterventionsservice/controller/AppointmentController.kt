package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.RecordAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
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

  @PutMapping("/appointment/{id}/record-attendance")
  fun recordAttendance(
    @PathVariable id: UUID,
    @RequestBody update: UpdateAppointmentAttendanceDTO,
    authentication: JwtAuthenticationToken,
  ): AppointmentDTO {
    val submittedBy = userMapper.fromToken(authentication)
    val updatedAppointment = appointmentService.recordAppointmentAttendance(
      id, update.attended, update.additionalAttendanceInformation, submittedBy
    )
    return AppointmentDTO.from(updatedAppointment)
  }

  @PostMapping("/appointment/{id}/submit")
  fun submitFeedback(
    @PathVariable id: UUID,
    authentication: JwtAuthenticationToken
  ): AppointmentDTO {
    val user = userMapper.fromToken(authentication)
    return AppointmentDTO.from(appointmentService.submitSessionFeedback(id, user))
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanSessionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.RecordAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanSessionsService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator.AppointmentValidator
import java.util.UUID

@RestController
class ActionPlanSessionController(
  val actionPlanSessionsService: ActionPlanSessionsService,
  val locationMapper: LocationMapper,
  val userMapper: UserMapper,
  val appointmentValidator: AppointmentValidator,
) {
  @PatchMapping("/action-plan/{id}/appointment/{sessionNumber}")
  fun updateSessionAppointment(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
    authentication: JwtAuthenticationToken,
  ): ActionPlanSessionDTO {
    val user = userMapper.fromToken(authentication)
    appointmentValidator.validateUpdateAppointment(updateAppointmentDTO)
    val actionPlanSession = actionPlanSessionsService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      updateAppointmentDTO.appointmentTime,
      updateAppointmentDTO.durationInMinutes,
      user,
      updateAppointmentDTO.appointmentDeliveryType,
      updateAppointmentDTO.appointmentDeliveryAddress
    )
    return ActionPlanSessionDTO.from(actionPlanSession)
  }

  @GetMapping("/action-plan/{id}/appointments")
  fun getSessions(
    @PathVariable(name = "id") actionPlanId: UUID
  ): List<ActionPlanSessionDTO> {

    val actionPlanSessions = actionPlanSessionsService.getSessions(actionPlanId)
    return ActionPlanSessionDTO.from(actionPlanSessions)
  }

  @GetMapping("/action-plan/{id}/appointments/{sessionNumber}")
  fun getSession(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
  ): ActionPlanSessionDTO {

    val actionPlanSession = actionPlanSessionsService.getSession(actionPlanId, sessionNumber)
    return ActionPlanSessionDTO.from(actionPlanSession)
  }

  @PostMapping("/action-plan/{id}/appointment/{sessionNumber}/record-attendance")
  fun recordAttendance(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    @RequestBody update: UpdateAppointmentAttendanceDTO,
  ): ActionPlanSessionDTO {
    val updatedSession = actionPlanSessionsService.recordAppointmentAttendance(
      actionPlanId, sessionNumber, update.attended, update.additionalAttendanceInformation
    )

    return ActionPlanSessionDTO.from(updatedSession)
  }

  @PostMapping("/action-plan/{actionPlanId}/appointment/{sessionNumber}/record-behaviour")
  fun recordBehaviour(@PathVariable actionPlanId: UUID, @PathVariable sessionNumber: Int, @RequestBody recordBehaviourDTO: RecordAppointmentBehaviourDTO): ActionPlanSessionDTO {
    return ActionPlanSessionDTO.from(actionPlanSessionsService.recordBehaviour(actionPlanId, sessionNumber, recordBehaviourDTO.behaviourDescription, recordBehaviourDTO.notifyProbationPractitioner))
  }

  @PostMapping("/action-plan/{actionPlanId}/appointment/{sessionNumber}/submit")
  fun submitSessionFeedback(@PathVariable actionPlanId: UUID, @PathVariable sessionNumber: Int, authentication: JwtAuthenticationToken): ActionPlanSessionDTO {
    val user = userMapper.fromToken(authentication)
    return ActionPlanSessionDTO.from(actionPlanSessionsService.submitSessionFeedback(actionPlanId, sessionNumber, user))
  }
}

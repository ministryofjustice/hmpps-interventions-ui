package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanSessionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanSessionsService
import java.util.UUID

@RestController
class ActionPlanSessionController(
  val actionPlanSessionsService: ActionPlanSessionsService,
  val locationMapper: LocationMapper
) {
  @PatchMapping("/action-plan/{id}/appointment/{sessionNumber}")
  fun updateSession(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
  ): ActionPlanSessionDTO {

    val actionPlanSession = actionPlanSessionsService.updateSession(
      actionPlanId,
      sessionNumber,
      updateAppointmentDTO.appointmentTime,
      updateAppointmentDTO.durationInMinutes
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
    val updatedSession = actionPlanSessionsService.recordAttendance(
      actionPlanId, sessionNumber, update.attended, update.additionalAttendanceInformation
    )

    return ActionPlanSessionDTO.from(updatedSession)
  }

  @PostMapping("/action-plan/{actionPlanId}/appointment/{sessionNumber}/record-behaviour")
  fun recordBehaviour(@PathVariable actionPlanId: UUID, @PathVariable sessionNumber: Int, @RequestBody update: UpdateAppointmentBehaviourDTO): ActionPlanSessionDTO {
    return ActionPlanSessionDTO.from(actionPlanSessionsService.recordBehaviour(actionPlanId, sessionNumber, update.behaviourDescription, update.notifyProbationPractitioner))
  }

  @PostMapping("/action-plan/{actionPlanId}/appointment/{sessionNumber}/submit")
  fun submitSessionFeedback(@PathVariable actionPlanId: UUID, @PathVariable sessionNumber: Int): ActionPlanSessionDTO {
    return ActionPlanSessionDTO.from(actionPlanSessionsService.submitSessionFeedback(actionPlanId, sessionNumber))
  }
}

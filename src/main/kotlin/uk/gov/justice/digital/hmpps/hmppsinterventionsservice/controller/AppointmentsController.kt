package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.NewAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentsService
import java.util.UUID

@RestController
class AppointmentsController(
  val jwtAuthUserMapper: JwtAuthUserMapper,
  val appointmentsService: AppointmentsService,
  val locationMapper: LocationMapper
) {

  @PostMapping("/action-plan/{id}/appointment")
  fun createAppointment(
    @PathVariable(name = "id") actionPlanId: UUID,
    @RequestBody newAppointmentDTO: NewAppointmentDTO,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<ActionPlanAppointmentDTO> {

    val createdByUser = jwtAuthUserMapper.map(authentication)

    val actionPlanAppointment = appointmentsService.createAppointment(
      actionPlanId,
      newAppointmentDTO.sessionNumber,
      newAppointmentDTO.appointmentTime,
      newAppointmentDTO.durationInMinutes,
      createdByUser
    )

    val actionPlanAppointmentDTO = ActionPlanAppointmentDTO.from(actionPlanAppointment)
    val location = locationMapper.mapToCurrentRequestBasePath(
      "/action-plan/{id}/appointment/{sessionNumber}",
      actionPlanId,
      newAppointmentDTO.sessionNumber
    )
    return ResponseEntity.created(location.toUri()).body(actionPlanAppointmentDTO)
  }

  @PatchMapping("/action-plan/{id}/appointment/{sessionNumber}")
  fun updateAppointment(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
  ): ActionPlanAppointmentDTO {

    val actionPlanAppointment = appointmentsService.updateAppointment(
      actionPlanId,
      sessionNumber,
      updateAppointmentDTO.appointmentTime,
      updateAppointmentDTO.durationInMinutes
    )
    return ActionPlanAppointmentDTO.from(actionPlanAppointment)
  }

  @GetMapping("/action-plan/{id}/appointments")
  fun getAppointments(
    @PathVariable(name = "id") actionPlanId: UUID
  ): List<ActionPlanAppointmentDTO> {

    val actionPlanAppointments = appointmentsService.getAppointments(actionPlanId)
    return ActionPlanAppointmentDTO.from(actionPlanAppointments)
  }

  @GetMapping("/action-plan/{id}/appointments/{sessionNumber}")
  fun getAppointment(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
  ): ActionPlanAppointmentDTO {

    val actionPlanAppointment = appointmentsService.getAppointment(actionPlanId, sessionNumber)
    return ActionPlanAppointmentDTO.from(actionPlanAppointment)
  }

  @PostMapping("/action-plan/{id}/appointment/{sessionNumber}/record-attendance")
  fun updateAppointmentWithAttendance(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    @RequestBody update: UpdateAppointmentAttendanceDTO,
  ): ActionPlanAppointmentDTO {
    val updatedAppointment = appointmentsService.updateAppointmentWithAttendance(
      actionPlanId, sessionNumber, update.sessionAttendance, update.additionalInformation
    )

    return ActionPlanAppointmentDTO.from(updatedAppointment)
  }
}

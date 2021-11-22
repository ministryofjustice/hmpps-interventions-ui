package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ReferralAccessChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DeliverySessionAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DeliverySessionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.RecordAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.DeliverySessionService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator.AppointmentValidator
import java.util.UUID
import javax.persistence.EntityNotFoundException

@RestController
class DeliverySessionController(
  val actionPlanService: ActionPlanService,
  val deliverySessionService: DeliverySessionService,
  val locationMapper: LocationMapper,
  val userMapper: UserMapper,
  val appointmentValidator: AppointmentValidator,
  val referralAccessChecker: ReferralAccessChecker,
  val referralService: ReferralService,
) {
  @PatchMapping("/action-plan/{id}/appointment/{sessionNumber}")
  fun updateSessionAppointment(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
    authentication: JwtAuthenticationToken,
  ): DeliverySessionDTO {
    val user = userMapper.fromToken(authentication)
    appointmentValidator.validateUpdateAppointment(updateAppointmentDTO)
    val deliverySession = deliverySessionService.updateSessionAppointment(
      actionPlanId,
      sessionNumber,
      updateAppointmentDTO.appointmentTime,
      updateAppointmentDTO.durationInMinutes,
      user,
      updateAppointmentDTO.appointmentDeliveryType,
      updateAppointmentDTO.sessionType,
      updateAppointmentDTO.appointmentDeliveryAddress,
      updateAppointmentDTO.npsOfficeCode,
    )
    return DeliverySessionDTO.from(deliverySession)
  }

  @GetMapping("/action-plan/{id}/appointments")
  fun getSessionsForActionPlan(
    @PathVariable(name = "id") actionPlanId: UUID
  ): List<DeliverySessionDTO> {

    val actionPlan = actionPlanService.getActionPlan(actionPlanId)
    val deliverySessions = deliverySessionService.getSessions(actionPlan.referral.id)
    return DeliverySessionDTO.from(deliverySessions)
  }

  @GetMapping("/action-plan/{id}/appointments/{sessionNumber}")
  fun getSessionForActionPlanId(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
  ): DeliverySessionDTO {

    val actionPlan = actionPlanService.getActionPlan(actionPlanId)
    val deliverySession = deliverySessionService.getSession(actionPlan.referral.id, sessionNumber)
    return DeliverySessionDTO.from(deliverySession)
  }

  @GetMapping("/referral/{id}/sessions/{sessionNumber}")
  fun getSessionForReferralId(
    @PathVariable(name = "id") referralId: UUID,
    @PathVariable sessionNumber: Int,
  ): DeliverySessionDTO {

    val deliverySession = deliverySessionService.getSession(referralId, sessionNumber)
    return DeliverySessionDTO.from(deliverySession)
  }

  @PostMapping("/action-plan/{id}/appointment/{sessionNumber}/record-attendance")
  fun recordAttendance(
    @PathVariable(name = "id") actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    @RequestBody update: UpdateAppointmentAttendanceDTO,
    authentication: JwtAuthenticationToken,
  ): DeliverySessionDTO {
    val user = userMapper.fromToken(authentication)
    val updatedSession = deliverySessionService.recordAppointmentAttendance(
      user, actionPlanId, sessionNumber, update.attended, update.additionalAttendanceInformation
    )

    return DeliverySessionDTO.from(updatedSession)
  }

  @PostMapping("/action-plan/{actionPlanId}/appointment/{sessionNumber}/record-behaviour")
  fun recordBehaviour(
    @PathVariable actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    @RequestBody recordBehaviourDTO: RecordAppointmentBehaviourDTO,
    authentication: JwtAuthenticationToken
  ): DeliverySessionDTO {
    val user = userMapper.fromToken(authentication)
    val updatedSession = deliverySessionService.recordBehaviour(
      user, actionPlanId, sessionNumber, recordBehaviourDTO.behaviourDescription, recordBehaviourDTO.notifyProbationPractitioner
    )
    return DeliverySessionDTO.from(updatedSession)
  }

  @PostMapping("/action-plan/{actionPlanId}/appointment/{sessionNumber}/submit")
  fun submitSessionFeedback(
    @PathVariable actionPlanId: UUID,
    @PathVariable sessionNumber: Int,
    authentication: JwtAuthenticationToken,
  ): DeliverySessionDTO {
    val user = userMapper.fromToken(authentication)
    return DeliverySessionDTO.from(deliverySessionService.submitSessionFeedback(actionPlanId, sessionNumber, user))
  }

  @GetMapping("/referral/{referralId}/delivery-session-appointments/{appointmentId}")
  fun getDeliverySessionAppointment(
    @PathVariable(name = "referralId") referralId: UUID,
    @PathVariable(name = "appointmentId") appointmentId: UUID,
    authentication: JwtAuthenticationToken,
  ): DeliverySessionAppointmentDTO {
    val user = userMapper.fromToken(authentication)
    val referral = referralService.getSentReferral(referralId) ?: throw ResponseStatusException(
      HttpStatus.BAD_REQUEST, "sent referral not found [referralId=$referralId]"
    )
    referralAccessChecker.forUser(referral, user)
    val matchingAppointment = deliverySessionService.getSessions(referralId)
      .flatMap { session -> session.appointments.map { appointment -> Pair(session.sessionNumber, appointment) } }
      .firstOrNull { appointment -> appointment.second.id == appointmentId }
      ?: throw EntityNotFoundException("Delivery session appointment not found [referralId=$referralId, appointmentId=$appointmentId]")
    return DeliverySessionAppointmentDTO.from(matchingAppointment.first, matchingAppointment.second)
  }
}

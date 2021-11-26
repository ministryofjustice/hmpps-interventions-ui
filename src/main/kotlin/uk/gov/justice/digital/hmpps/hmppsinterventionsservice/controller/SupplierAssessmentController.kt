package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.RecordAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.SupplierAssessmentService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator.AppointmentValidator
import java.time.OffsetDateTime
import java.util.UUID

@RestController
class SupplierAssessmentController(
  private val referralService: ReferralService,
  private val supplierAssessmentService: SupplierAssessmentService,
  private val userMapper: UserMapper,
  private val appointmentValidator: AppointmentValidator,
  private val appointmentService: AppointmentService,
) {

  @Deprecated("superseded by POST /referral/{referralId}/supplier-assessment and PUT /referral/{referralId}/supplier-assessment/{appointmentId}")
  @PutMapping("/supplier-assessment/{id}/schedule-appointment")
  fun updateSupplierAssessmentAppointment(
    @PathVariable id: UUID,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
    authentication: JwtAuthenticationToken,
  ): AppointmentDTO {
    val user = userMapper.fromToken(authentication)
    val supplierAssessment = supplierAssessmentService.getSupplierAssessmentById(id)
    appointmentValidator.validateUpdateAppointment(updateAppointmentDTO)
    val pastAppointment = updateAppointmentDTO.appointmentTime.isBefore(OffsetDateTime.now())
    return AppointmentDTO.from(
      supplierAssessmentService.createOrUpdateSupplierAssessmentAppointment(
        supplierAssessment,
        updateAppointmentDTO.durationInMinutes,
        updateAppointmentDTO.appointmentTime,
        user,
        updateAppointmentDTO.appointmentDeliveryType,
        updateAppointmentDTO.sessionType,
        updateAppointmentDTO.appointmentDeliveryAddress,
        updateAppointmentDTO.npsOfficeCode,
        updateAppointmentDTO.appointmentAttendance?.attended,
        updateAppointmentDTO.appointmentAttendance?.additionalAttendanceInformation,
        updateAppointmentDTO.appointmentBehaviour?.notifyProbationPractitioner,
        updateAppointmentDTO.appointmentBehaviour?.behaviourDescription,
        pastAppointment
      )
    )
  }

  @PostMapping("/referral/{referralId}/supplier-assessment")
  fun scheduleSupplierAssessmentAppointment(
    @PathVariable referralId: UUID,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
    authentication: JwtAuthenticationToken,
  ): AppointmentDTO {
    val user = userMapper.fromToken(authentication)
    appointmentValidator.validateUpdateAppointment(updateAppointmentDTO)
    val appointment = supplierAssessmentService.scheduleNewSupplierAssessmentAppointment(
      referralId,
      updateAppointmentDTO.durationInMinutes,
      updateAppointmentDTO.appointmentTime,
      user,
      updateAppointmentDTO.appointmentDeliveryType,
      updateAppointmentDTO.appointmentDeliveryAddress,
      updateAppointmentDTO.npsOfficeCode
    )
    return AppointmentDTO.from(appointment)
  }

  @PutMapping("/referral/{referralId}/supplier-assessment/{appointmentId}")
  fun rescheduleSupplierAssessmentAppointment(
    @PathVariable referralId: UUID,
    @PathVariable appointmentId: UUID,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
    authentication: JwtAuthenticationToken,
  ): AppointmentDTO {
    val user = userMapper.fromToken(authentication)
    appointmentValidator.validateUpdateAppointment(updateAppointmentDTO)
    val appointment = supplierAssessmentService.rescheduleSupplierAssessmentAppointment(
      referralId,
      appointmentId,
      updateAppointmentDTO.durationInMinutes,
      updateAppointmentDTO.appointmentTime,
      user,
      updateAppointmentDTO.appointmentDeliveryType,
      updateAppointmentDTO.sessionType,
      updateAppointmentDTO.appointmentDeliveryAddress,
      updateAppointmentDTO.npsOfficeCode
    )
    return AppointmentDTO.from(appointment)
  }

  @PutMapping("/referral/{referralId}/supplier-assessment/record-behaviour")
  fun recordAppointmentBehaviour(
    @PathVariable referralId: UUID,
    @RequestBody recordBehaviourDTO: RecordAppointmentBehaviourDTO,
    authentication: JwtAuthenticationToken,
  ): AppointmentDTO {
    val user = userMapper.fromToken(authentication)
    val supplierAssessmentAppointment = getSupplierAssessmentAppointment(referralId, user)

    return AppointmentDTO.from(
      appointmentService.recordBehaviour(
        supplierAssessmentAppointment, recordBehaviourDTO.behaviourDescription, recordBehaviourDTO.notifyProbationPractitioner, user
      )
    )
  }

  @PutMapping("/referral/{referralId}/supplier-assessment/record-attendance")
  fun recordAttendance(
    @PathVariable referralId: UUID,
    @RequestBody update: UpdateAppointmentAttendanceDTO,
    authentication: JwtAuthenticationToken,
  ): AppointmentDTO {
    val submittedBy = userMapper.fromToken(authentication)
    val supplierAssessmentAppointment = getSupplierAssessmentAppointment(referralId, submittedBy)
    val updatedAppointment = appointmentService.recordAppointmentAttendance(
      supplierAssessmentAppointment, update.attended, update.additionalAttendanceInformation, submittedBy
    )
    return AppointmentDTO.from(updatedAppointment)
  }

  @PostMapping("/referral/{referralId}/supplier-assessment/submit-feedback")
  fun submitFeedback(
    @PathVariable referralId: UUID,
    authentication: JwtAuthenticationToken
  ): AppointmentDTO {
    val user = userMapper.fromToken(authentication)
    val supplierAssessmentAppointment = getSupplierAssessmentAppointment(referralId, user)
    return AppointmentDTO.from(appointmentService.submitSessionFeedback(supplierAssessmentAppointment, user, AppointmentType.SUPPLIER_ASSESSMENT))
  }

  private fun getSupplierAssessmentAppointment(referralId: UUID, user: AuthUser): Appointment {
    val referral = referralService.getSentReferralForUser(referralId, user)
    if (referral == null) {
      throw ResponseStatusException(HttpStatus.NOT_FOUND, "referral not found [id=$referralId]")
    }
    if (referral.supplierAssessment == null) {
      throw ResponseStatusException(HttpStatus.NOT_FOUND, "supplier assessment not found for referral [id=$referralId]")
    }
    if (referral.supplierAssessment!!.currentAppointment == null) {
      throw ResponseStatusException(HttpStatus.NOT_FOUND, "no current appointment exists on supplier assessment for referral [id=$referralId]")
    }
    return referral.supplierAssessment!!.currentAppointment!!
  }
}

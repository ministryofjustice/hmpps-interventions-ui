package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SupplierAssessmentAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SupplierAssessmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.SupplierAssessmentService
import java.util.UUID

@RestController
class SupplierAssessmentController(
  private val supplierAssessmentService: SupplierAssessmentService,
  private val referralService: ReferralService,
  private val userMapper: UserMapper,
) {
  @PatchMapping("/sent-referral/{id}/supplier-assessment-appointment")
  fun updateSupplierAssessmentAppointment(
    @PathVariable id: UUID,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
    authentication: JwtAuthenticationToken,
  ): SupplierAssessmentDTO {
    val user = userMapper.fromToken(authentication)

    val sentReferral = referralService.getSentReferralForUser(id, user)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")

    return SupplierAssessmentDTO.from(
      supplierAssessmentService.updateSupplierAssessmentAppointment(
        sentReferral, updateAppointmentDTO.durationInMinutes,
        updateAppointmentDTO.appointmentTime,
        user
      )
    )
  }

  @GetMapping("sent-referral/{id}/supplier-assessment-appointment")
  fun getSupplierAssessmentAppointment(
    @PathVariable id: UUID,
    authentication: JwtAuthenticationToken,
  ): SupplierAssessmentAppointmentDTO {
    val user = userMapper.fromToken(authentication)

    val sentReferral = referralService.getSentReferralForUser(id, user)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")

    if (sentReferral.supplierAssessment!!.appointments.size == 0) {
      throw ResponseStatusException(HttpStatus.NOT_FOUND, "no appointment found for supplier assessment [id=${sentReferral.supplierAssessment!!.id}]")
    }

    return SupplierAssessmentAppointmentDTO.from(sentReferral.supplierAssessment!!.appointment)
  }
}

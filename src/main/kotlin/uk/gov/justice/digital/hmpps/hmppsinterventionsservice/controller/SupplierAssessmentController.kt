package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.SupplierAssessmentService
import java.util.UUID

@RestController
class SupplierAssessmentController(
  private val supplierAssessmentService: SupplierAssessmentService,
  private val userMapper: UserMapper,
) {
  @PutMapping("/supplier-assessment/{id}/schedule-appointment")
  fun updateSupplierAssessmentAppointment(
    @PathVariable id: UUID,
    @RequestBody updateAppointmentDTO: UpdateAppointmentDTO,
    authentication: JwtAuthenticationToken,
  ): AppointmentDTO {
    val user = userMapper.fromToken(authentication)

    return AppointmentDTO.from(
      supplierAssessmentService.scheduleOrUpdateSupplierAssessmentAppointment(
        id,
        updateAppointmentDTO.durationInMinutes,
        updateAppointmentDTO.appointmentTime,
        user
      )
    )
  }
}

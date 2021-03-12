package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndOfServiceReportDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.EndOfServiceReportService
import java.util.UUID

@RestController
class EndOfServiceReportController(
  val jwtAuthUserMapper: JwtAuthUserMapper,
  val locationMapper: LocationMapper,
  val endOfServiceReportService: EndOfServiceReportService,
) {

  @PostMapping("/referral/{id}/end-of-service-report")
  fun createEndOfServiceReport(
    @PathVariable id: UUID,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<EndOfServiceReportDTO> {

    val createdByUser = jwtAuthUserMapper.map(authentication)
    val endOfServiceReport = endOfServiceReportService.createEndOfServiceReport(id, createdByUser)

    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)
    val location = locationMapper.mapToCurrentRequestBasePath("/{id}", endOfServiceReportDTO.id)
    return ResponseEntity.created(location.toUri()).body(endOfServiceReportDTO)
  }

  @GetMapping("/end-of-service-report/{id}")
  fun getEndOfServiceReportById(
    @PathVariable id: UUID
  ): EndOfServiceReportDTO {
    val endOfServiceReport = endOfServiceReportService.getEndOfServiceReport(id)
    return EndOfServiceReportDTO.from(endOfServiceReport)
  }
}

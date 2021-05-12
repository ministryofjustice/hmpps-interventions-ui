package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.EndOfServiceReportOutcomeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateEndOfServiceReportDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndOfServiceReportDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateEndOfServiceReportDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.EndOfServiceReportService
import java.util.UUID

@RestController
class EndOfServiceReportController(
  val userMapper: UserMapper,
  val locationMapper: LocationMapper,
  val endOfServiceReportService: EndOfServiceReportService,
  val endOfServiceReportOutcomeMapper: EndOfServiceReportOutcomeMapper,
) {

  @PostMapping("/draft-end-of-service-report")
  fun createEndOfServiceReport(
    @RequestBody createEndOfServiceReportDTO: CreateEndOfServiceReportDTO,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<EndOfServiceReportDTO> {

    val createdByUser = userMapper.fromToken(authentication)
    val endOfServiceReport = endOfServiceReportService.createEndOfServiceReport(createEndOfServiceReportDTO.referralId, createdByUser)

    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)
    val location = locationMapper.expandPathToCurrentRequestBaseUrl("/{id}", endOfServiceReportDTO.id)
    return ResponseEntity.created(location).body(endOfServiceReportDTO)
  }

  @GetMapping("/end-of-service-report/{id}")
  fun getEndOfServiceReportById(
    @PathVariable id: UUID
  ): EndOfServiceReportDTO {
    val endOfServiceReport = endOfServiceReportService.getEndOfServiceReport(id)
    return EndOfServiceReportDTO.from(endOfServiceReport)
  }

  @GetMapping("/end-of-service-report")
  fun getEndOfServiceReportByReferralId(
    @RequestParam(name = "referralId", required = true) referralId: UUID
  ): EndOfServiceReportDTO {
    val endOfServiceReport = endOfServiceReportService.getEndOfServiceReportByReferralId(referralId)
    return EndOfServiceReportDTO.from(endOfServiceReport)
  }

  @PatchMapping("/draft-end-of-service-report/{id}")
  fun updateEndOfServiceReport(
    @PathVariable id: UUID,
    @RequestBody update: UpdateEndOfServiceReportDTO,
  ): EndOfServiceReportDTO {
    val newOutcome = update.outcome?.let { endOfServiceReportOutcomeMapper.mapCreateEndOfServiceReportOutcomeDtoToEndOfServiceReportOutcome(it) }
    val updatedEndOfServiceReport = endOfServiceReportService.updateEndOfServiceReport(id, update.furtherInformation, newOutcome)

    return EndOfServiceReportDTO.from(updatedEndOfServiceReport)
  }

  @PostMapping("/draft-end-of-service-report/{id}/submit")
  fun submitEndOfServiceReport(
    @PathVariable id: UUID,
    authentication: JwtAuthenticationToken
  ): EndOfServiceReportDTO {
    val submittedByUser = userMapper.fromToken(authentication)
    val submittedEndOfServiceReport = endOfServiceReportService.submitEndOfServiceReport(id, submittedByUser)

    return EndOfServiceReportDTO.from(submittedEndOfServiceReport)
  }
}

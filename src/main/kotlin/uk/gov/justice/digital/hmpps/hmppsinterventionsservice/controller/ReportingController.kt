package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReportingService
import java.time.LocalDate

@RestController
class ReportingController(
  private val reportingService: ReportingService,
  private val userMapper: UserMapper,
) {
  @PostMapping("/service-provider/referral-report")
  fun createPerformanceReport(
    @RequestParam("fromDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
    @RequestParam("toDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<Any> {
    reportingService.generateServiceProviderReferralReport(from, to, userMapper.fromToken(authentication))
    return ResponseEntity.accepted().build()
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReportingService
import java.time.LocalDate

data class DateInterval(
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) val fromDate: LocalDate,
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) val toDate: LocalDate,
)

@RestController
class ReportingController(
  private val reportingService: ReportingService,
  private val userMapper: UserMapper,
) {
  @PostMapping("/reports/service-provider/performance")
  fun creatServiceProviderPerformanceReport(
    @RequestBody dateInterval: DateInterval,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<Any> {
    reportingService.generateServiceProviderPerformanceReport(dateInterval.fromDate, dateInterval.toDate, userMapper.fromToken(authentication))
    return ResponseEntity.accepted().build()
  }

  @PostMapping("/reports/ndmis/performance")
  fun createNdmisPerformanceReport(
  ): ResponseEntity<Any> {
    reportingService.generateNdmisPerformanceReport()
    return ResponseEntity.accepted().build()
  }
}

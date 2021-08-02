package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.batch.core.Job
import org.springframework.batch.core.JobParametersBuilder
import org.springframework.batch.core.launch.JobLauncher
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceProviderAccessScopeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.BatchUtils
import java.time.Instant
import java.time.LocalDate

@Service
class ReportingService(
  private val jobLauncher: JobLauncher,
  private val performanceReportJob: Job,
  private val serviceProviderAccessScopeMapper: ServiceProviderAccessScopeMapper,
  private val batchUtils: BatchUtils,
) {
  fun generateServiceProviderPerformanceReport(from: LocalDate, to: LocalDate, user: AuthUser) {
    // this is really not ideal - but the intention here is validate the user has
    // a valid access scope before launching the job (which will also call this method).
    serviceProviderAccessScopeMapper.fromUser(user)

    jobLauncher.run(
      performanceReportJob,
      JobParametersBuilder()
        .addString("user.id", user.id)
        .addDate("from", batchUtils.parseLocalDateToDate(from))
        .addDate("to", batchUtils.parseLocalDateToDate(to.plusDays(1))) // 'to' is inclusive
        .addString("timestamp", Instant.now().toEpochMilli().toString())
        .toJobParameters()
    )
  }
}

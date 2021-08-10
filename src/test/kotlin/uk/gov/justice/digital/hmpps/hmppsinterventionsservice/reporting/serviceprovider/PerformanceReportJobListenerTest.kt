package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import org.springframework.batch.core.BatchStatus
import org.springframework.batch.core.JobExecution
import org.springframework.batch.core.JobParametersBuilder
import org.springframework.batch.item.ExecutionContext
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance.PerformanceReportJobListener
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.S3Service

internal class PerformanceReportJobListenerTest {
  private val s3Service = mock<S3Service>()
  private val emailSender = mock<EmailSender>()
  private val listener = PerformanceReportJobListener(
    s3Service,
    emailSender,
    "email-template",
    "https://interventions.com",
    "/sp-report-download?file={filename}",
  )

  @Test
  fun `afterJob sends email with correct name and url`() {
    val jobExecution = JobExecution(
      123L,
      JobParametersBuilder()
        .addString("user.firstName", "tom")
        .addString("user.email", "tom@tom.tom")
        .toJobParameters()
    )
    jobExecution.executionContext = ExecutionContext(mapOf("output.file.path" to "/tmp/foo/tom.csv"))
    jobExecution.status = BatchStatus.COMPLETED

    listener.afterJob(jobExecution)

    verify(emailSender).sendEmail(
      "email-template",
      "tom@tom.tom",
      mapOf("serviceProviderFirstName" to "tom", "reportUrl" to "https://interventions.com/sp-report-download?file=tom.csv")
    )
  }
}

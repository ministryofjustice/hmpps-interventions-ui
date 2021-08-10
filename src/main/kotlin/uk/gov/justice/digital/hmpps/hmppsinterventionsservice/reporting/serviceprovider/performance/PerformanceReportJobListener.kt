package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.batch.core.BatchStatus
import org.springframework.batch.core.JobExecution
import org.springframework.batch.core.JobExecutionListener
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.S3Service
import java.io.File
import kotlin.io.path.Path
import kotlin.io.path.createTempDirectory

@Component
class PerformanceReportJobListener(
  private val s3Service: S3Service,
  private val emailSender: EmailSender,
  @Value("\${notify.templates.service-provider-performance-report-ready}") private val notifyTemplateId: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUiBaseUrl: String,
  @Value("\${interventions-ui.locations.service-provider.download-report}") private val downloadLocation: String,
) : JobExecutionListener {
  companion object : KLogging()

  override fun beforeJob(jobExecution: JobExecution) {
    // create a temp file for the job to write to and store the path in the execution context
    val params = jobExecution.jobParameters.parameters
    val path = createTempDirectory().resolve("${params["user.id"]}_${params["timestamp"]}.csv")

    logger.info("creating csv file for service provider performance report {}", StructuredArguments.kv("path", path))

    jobExecution.executionContext.put("output.file.path", path.toString())
  }

  override fun afterJob(jobExecution: JobExecution) {
    if (jobExecution.status == BatchStatus.COMPLETED) {
      val path = Path(jobExecution.executionContext.getString("output.file.path"))

      s3Service.publishFileToS3(path, "reports/service-provider/performance/")

      emailSender.sendEmail(
        notifyTemplateId,
        jobExecution.jobParameters.getString("user.email"),
        mapOf(
          "serviceProviderFirstName" to jobExecution.jobParameters.getString("user.firstName"),
          "reportUrl" to UriComponentsBuilder.fromHttpUrl(interventionsUiBaseUrl)
            .path(downloadLocation)
            .buildAndExpand(path.fileName)
            .toString()
        )
      )

      // delete the file now the job is successfully completed
      logger.info("deleting csv file for service provider report {}", StructuredArguments.kv("path", path))
      File(path.toString()).delete()
    }
  }
}

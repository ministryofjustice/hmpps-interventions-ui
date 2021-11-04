 package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

 import mu.KLogging
 import net.logstash.logback.argument.StructuredArguments.kv
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
 class NdmisPerformanceReportJobListener(
  private val s3Service: S3Service,
  private val emailSender: EmailSender,
  @Value("\${notify.templates.service-provider-performance-report-ready}") private val successNotifyTemplateId: String,
  @Value("\${notify.templates.service-provider-performance-report-failed}") private val failureNotifyTemplateId: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUiBaseUrl: String,
  @Value("\${interventions-ui.locations.service-provider.download-report}") private val downloadLocation: String,
 ) : JobExecutionListener {
  companion object : KLogging()

  override fun beforeJob(jobExecution: JobExecution) {
    // create a temp file for the job to write to and store the path in the execution context
    val params = jobExecution.jobParameters.parameters
    val path = createTempDirectory().resolve("${params["timestamp"]}.csv")

    logger.debug("creating csv file for ndmis performance report {}", kv("path", path))

    jobExecution.executionContext.put("output.file.path", path.toString())
  }

  override fun afterJob(jobExecution: JobExecution) {
    val path = Path(jobExecution.executionContext.getString("output.file.path"))

    when (jobExecution.status) {
      BatchStatus.COMPLETED -> {
 //        s3Service.publishFileToS3(path, "reports/crs/crs_performance_report-v2-complexity")
      }
      BatchStatus.FAILED -> {
        logger.error("failed reporting")
      }
      else -> {
        logger.warn(
          "unexpected status encountered for performance report {} {}",
          kv("status", jobExecution.status),
          kv("exitDescription", jobExecution.exitStatus.exitDescription)
        )
      }
    }

    // delete the temporary csv file regardless of the job status
    logger.debug("deleting csv file for service provider report {}", kv("path", path))
//    File(path.toString()).delete()
  }
 }

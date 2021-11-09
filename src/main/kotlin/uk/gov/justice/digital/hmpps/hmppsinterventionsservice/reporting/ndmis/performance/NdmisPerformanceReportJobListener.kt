 package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

 import mu.KLogging
 import net.logstash.logback.argument.StructuredArguments.kv
 import org.springframework.batch.core.BatchStatus
 import org.springframework.batch.core.ExitStatus
 import org.springframework.batch.core.JobExecution
 import org.springframework.batch.core.JobExecutionListener
 import org.springframework.batch.core.StepExecution
 import org.springframework.batch.core.StepExecutionListener
 import org.springframework.beans.factory.annotation.Value
 import org.springframework.stereotype.Component
 import org.springframework.web.util.UriComponentsBuilder
 import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
 import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.S3Bucket
 import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.S3Service
 import java.io.File
 import kotlin.io.path.Path
 import kotlin.io.path.createTempDirectory

 @Component
 class NdmisPerformanceReportJobListener(
   private val s3Service: S3Service,
   private val storageS3Bucket: S3Bucket,
   private val emailSender: EmailSender,
   @Value("\${notify.templates.service-provider-performance-report-ready}") private val successNotifyTemplateId: String,
   @Value("\${notify.templates.service-provider-performance-report-failed}") private val failureNotifyTemplateId: String,
   @Value("\${interventions-ui.baseurl}") private val interventionsUiBaseUrl: String,
   @Value("\${interventions-ui.locations.service-provider.download-report}") private val downloadLocation: String,
 ) : JobExecutionListener, StepExecutionListener {
  companion object : KLogging()

  override fun beforeJob(jobExecution: JobExecution) {
    jobExecution.executionContext.put("fileName", null)
    logger.debug("starting ndmis performance report job")
  }

  override fun afterJob(jobExecution: JobExecution) {
    logger.debug("finished ndmis performance report job")
  }

   override fun beforeStep(stepExecution: StepExecution) {
     // create a temp file for the job to write to and store the path in the execution context
//     val fileName = stepExecution.jobExecution.executionContext.getString("fileName")
     val fileName = when(stepExecution.stepName){
       "ndmisWriteReferralToCsvStep" -> "crs_performance_report-v2-referral"
       "ndmisWriteComplexityToCsvStep" -> "crs_performance_report-v2-complexity"
       "ndmisWriteAppointmentToCsvStep" -> "crs_performance_report-v2-appointment"
       else ->  null
     }
     val path = createTempDirectory("abc").resolve("${fileName}.csv")

     logger.debug("creating csv file for ndmis performance report {}", kv("path", path))
     stepExecution.jobExecution.executionContext.put("output.file.path", path.toString())
     stepExecution.jobExecution.executionContext.put("fileName", fileName)
   }

   override fun afterStep(stepExecution: StepExecution): ExitStatus? {
     val path = Path(stepExecution.jobExecution.executionContext.getString("output.file.path"))
     val fileName = stepExecution.jobExecution.executionContext.getString("fileName")
     when (stepExecution.status) {
      BatchStatus.COMPLETED -> {
         s3Service.publishFileToS3(storageS3Bucket, path, "export/csv/reports/${fileName}")
      }
      BatchStatus.FAILED -> {
        logger.error("failed reporting")
      }
      else -> {
        logger.warn(
          "unexpected status encountered for performance report {} {}",
          kv("status", stepExecution.status),
          kv("exitDescription", stepExecution.exitStatus.exitDescription)
        )
      }
    }
     logger.debug("deleting csv file for ndmis performance report {}", kv("path", path))
//     File(path.toString()).delete()
     return stepExecution.exitStatus
   }
 }

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.batch.core.BatchStatus
import org.springframework.batch.core.ExitStatus
import org.springframework.batch.core.StepExecution
import org.springframework.batch.core.StepExecutionListener
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.S3Bucket
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.S3Service
import java.io.File
import kotlin.io.path.Path
import kotlin.io.path.createTempDirectory

@Component
class ListenerFactory(
  private val s3Service: S3Service,
  private val ndmisS3Bucket: S3Bucket,
) {
  companion object : KLogging()
  private val tmpDir = createTempDirectory()

  fun createListener(filename: String): StepExecutionListener {
    return object : StepExecutionListener {
      override fun beforeStep(stepExecution: StepExecution) {
        // create a temp file for the job to write to and store the path in the execution context
        val path = tmpDir.resolve("$filename.csv")

        logger.debug("creating csv file for ndmis performance report {}", StructuredArguments.kv("path", path))
        stepExecution.jobExecution.executionContext.put("output.file.path", path.toString())
      }

      override fun afterStep(stepExecution: StepExecution): ExitStatus? {
        val path = Path(stepExecution.jobExecution.executionContext.getString("output.file.path"))
        when (stepExecution.status) {
          BatchStatus.COMPLETED -> {
            s3Service.publishFileToS3(ndmisS3Bucket, path, "export/csv/reports/")
          }
          BatchStatus.FAILED -> {
            logger.error("failed reporting")
          }
          else -> {
            logger.warn(
              "unexpected status encountered for performance report {} {}",
              StructuredArguments.kv("status", stepExecution.status),
              StructuredArguments.kv("exitDescription", stepExecution.exitStatus.exitDescription)
            )
          }
        }
        logger.debug("deleting csv file for ndmis performance report {}", StructuredArguments.kv("path", path))
        File(path.toString()).delete()
        return stepExecution.exitStatus
      }
    }
  }
}

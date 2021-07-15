package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.batch.core.BatchStatus
import org.springframework.batch.core.JobExecution
import org.springframework.batch.core.JobExecutionListener
import org.springframework.stereotype.Component
import java.io.File
import kotlin.io.path.createTempDirectory

@Component
class PerformanceReportJobListener() : JobExecutionListener {
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
      val path = jobExecution.executionContext.get("output.file.path") as String

      // delete the file now the job is successfully completed
      logger.info("deleting csv file for service provider report {}", StructuredArguments.kv("path", path))
      File(path).delete()
    }
  }
}

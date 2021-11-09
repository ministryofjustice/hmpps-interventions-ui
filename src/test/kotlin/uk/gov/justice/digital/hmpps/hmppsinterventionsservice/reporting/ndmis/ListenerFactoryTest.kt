package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.batch.core.BatchStatus
import org.springframework.batch.core.JobExecution
import org.springframework.batch.core.JobParametersBuilder
import org.springframework.batch.core.StepExecution
import org.springframework.batch.item.ExecutionContext
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.S3Bucket
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance.ListenerFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.S3Service
import kotlin.io.path.Path

class ListenerFactoryTest {
  private val s3Service = mock<S3Service>()
  private val s3Bucket = mock<S3Bucket>()

  private val listener = ListenerFactory(
    s3Service,
    s3Bucket
  )

  @Test
  fun `after step publishes to s3`() {
    val stepExecution = createStepExecution()
    stepExecution.jobExecution.executionContext = ExecutionContext(mapOf("output.file.path" to "/tmp/foo/abc.csv"))
    stepExecution.status = BatchStatus.COMPLETED
    listener.createListener("appointment").afterStep(stepExecution)
    verify(s3Service).publishFileToS3(s3Bucket, Path("/tmp/foo/abc.csv"), "export/csv/reports/")
  }

  @Test
  fun `before step adds file with correct filename to job context`() {
    val stepExecution = createStepExecution()
    listener.createListener("appointment").beforeStep(stepExecution)
    val path = stepExecution.jobExecution.executionContext.getString("output.file.path")
    assertThat(path).contains("appointment.csv")
  }
}

private fun createStepExecution(
  jobId: Long = 123L,
  jobTimestamp: String = "1111111111111",
  stepName: String = "step1",
): StepExecution {
  val jobExecution = JobExecution(jobId, JobParametersBuilder().addString("timestamp", jobTimestamp).toJobParameters())
  return StepExecution(stepName, jobExecution)
}

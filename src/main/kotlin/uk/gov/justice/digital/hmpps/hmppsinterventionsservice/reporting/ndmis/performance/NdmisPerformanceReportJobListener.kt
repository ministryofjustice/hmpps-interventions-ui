package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import mu.KLogging
import org.springframework.batch.core.JobExecution
import org.springframework.batch.core.JobExecutionListener
import org.springframework.stereotype.Component

@Component
class NdmisPerformanceReportJobListener() : JobExecutionListener {
  companion object : KLogging()

  override fun beforeJob(jobExecution: JobExecution) {
    jobExecution.executionContext.put("fileName", null)
    logger.debug("starting ndmis performance report job")
  }

  override fun afterJob(jobExecution: JobExecution) {
    logger.debug("finished ndmis performance report job")
  }
}

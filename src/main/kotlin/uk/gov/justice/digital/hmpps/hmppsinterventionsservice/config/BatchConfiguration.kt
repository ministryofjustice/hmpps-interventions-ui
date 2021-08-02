package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import org.springframework.batch.core.launch.JobLauncher
import org.springframework.batch.core.launch.support.SimpleJobLauncher
import org.springframework.batch.core.repository.JobRepository
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.task.SimpleAsyncTaskExecutor

@Configuration
class BatchConfiguration {
  @Bean
  fun asyncJobLauncher(jobRepository: JobRepository): JobLauncher {
    val launcher = SimpleJobLauncher()
    launcher.setJobRepository(jobRepository)
    launcher.setTaskExecutor(SimpleAsyncTaskExecutor())
    launcher.afterPropertiesSet()
    return launcher
  }
}

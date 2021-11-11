package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jobs.oneoff

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.batch.core.Job
import org.springframework.batch.core.converter.DefaultJobParametersConverter
import org.springframework.batch.core.launch.JobLauncher
import org.springframework.batch.core.launch.support.SimpleJvmExitCodeMapper
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import kotlin.system.exitProcess

@Component
class OnStartupJobLauncherFactory(
  private val jobLauncher: JobLauncher,
) {
  companion object : KLogging()

  private val exitCodeMapper = SimpleJvmExitCodeMapper()
  private val jobParametersConverter = DefaultJobParametersConverter()

  fun makeLauncher(jobName: String, entryPoint: (args: ApplicationArguments) -> Int): ApplicationRunner {
    return ApplicationRunner { args ->
      if (args.getOptionValues("jobName")?.contains(jobName) == true) {
        logger.info("running one off job {}", StructuredArguments.kv("jobName", jobName))
        exitProcess(entryPoint(args))
      }
    }
  }

  fun makeBatchLauncher(job: Job): ApplicationRunner {
    val entryPoint = fun(args: ApplicationArguments): Int {
      val params = jobParametersConverter.getJobParameters(
        StringUtils.splitArrayElementsIntoProperties(args.nonOptionArgs.toTypedArray(), "=")
      )

      val execution = jobLauncher.run(job, params)
      return exitCodeMapper.intValue(execution.exitStatus.exitCode)
    }

    return makeLauncher(job.name, entryPoint)
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import org.hibernate.SessionFactory
import org.springframework.batch.core.Job
import org.springframework.batch.core.Step
import org.springframework.batch.core.StepContribution
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory
import org.springframework.batch.core.configuration.annotation.JobScope
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory
import org.springframework.batch.core.configuration.annotation.StepScope
import org.springframework.batch.core.job.DefaultJobParametersValidator
import org.springframework.batch.core.scope.context.ChunkContext
import org.springframework.batch.item.database.HibernateCursorItemReader
import org.springframework.batch.item.database.builder.HibernateCursorItemReaderBuilder
import org.springframework.batch.item.file.FlatFileItemWriter
import org.springframework.batch.repeat.RepeatStatus
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.FileSystemResource
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.S3Bucket
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jobs.oneoff.OnStartupJobLauncherFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.BatchUtils
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.S3Service
import java.io.File
import kotlin.io.path.createTempDirectory

@Configuration
@EnableBatchProcessing
class NdmisPerformanceReportJobConfiguration(
  private val jobBuilderFactory: JobBuilderFactory,
  private val stepBuilderFactory: StepBuilderFactory,
  private val batchUtils: BatchUtils,
  private val s3Service: S3Service,
  private val ndmisS3Bucket: S3Bucket,
  private val onStartupJobLauncherFactory: OnStartupJobLauncherFactory,
  @Value("\${spring.batch.jobs.ndmis.performance-report.page-size}") private val pageSize: Int,
  @Value("\${spring.batch.jobs.ndmis.performance-report.chunk-size}") private val chunkSize: Int,
) {
  private val tmpDir = createTempDirectory()
  private val referralReportPath = tmpDir.resolve("crs_performance_report-v2-referrals.csv")
  private val complexityReportPath = tmpDir.resolve("crs_performance_report-v2-complexity.csv")
  private val appointmentsReportPath = tmpDir.resolve("crs_performance_report-v2-appointments.csv")

  @Bean
  fun ndmisPerformanceReportJobLauncher(ndmisPerformanceReportJob: Job): ApplicationRunner {
    return onStartupJobLauncherFactory.makeBatchLauncher(ndmisPerformanceReportJob)
  }

  @Bean
  @JobScope
  fun ndmisReader(
    sessionFactory: SessionFactory,
  ): HibernateCursorItemReader<Referral> {
    // this reader returns referral entities which need processing for the report.
    return HibernateCursorItemReaderBuilder<Referral>()
      .name("ndmisPerformanceReportReader")
      .sessionFactory(sessionFactory)
      .queryString("select r from Referral r where sent_at is not null")
      .build()
  }

  @Bean
  @StepScope
  fun ndmisReferralsWriter(): FlatFileItemWriter<ReferralsData> {
    return batchUtils.csvFileWriter(
      "ndmisReferralsPerformanceReportWriter",
      FileSystemResource(referralReportPath),
      ReferralsData.headers,
      ReferralsData.fields
    )
  }

  @Bean
  @StepScope
  fun ndmisComplexityWriter(): FlatFileItemWriter<Collection<ComplexityData>> {
    return batchUtils.recursiveCollectionCsvFileWriter(
      "ndmisComplexityPerformanceReportWriter",
      FileSystemResource(complexityReportPath),
      ComplexityData.headers,
      ComplexityData.fields
    )
  }

  @Bean
  @StepScope
  fun ndmisAppointmentWriter(): FlatFileItemWriter<Collection<AppointmentData>> {
    return batchUtils.recursiveCollectionCsvFileWriter(
      "ndmisAppointmentPerformanceReportWriter",
      FileSystemResource(appointmentsReportPath),
      AppointmentData.headers,
      AppointmentData.fields
    )
  }

  @Bean
  fun ndmisPerformanceReportJob(
    ndmisWriteReferralToCsvStep: Step,
    ndmisWriteComplexityToCsvStep: Step,
    ndmisWriteAppointmentToCsvStep: Step
  ): Job {
    val validator = DefaultJobParametersValidator()
    validator.setRequiredKeys(
      arrayOf(
        "timestamp",
      )
    )

    return jobBuilderFactory["ndmisPerformanceReportJob"]
      .validator(validator)
      .start(ndmisWriteReferralToCsvStep)
      .next(ndmisWriteComplexityToCsvStep)
      .next(ndmisWriteAppointmentToCsvStep)
      .next(pushToS3Step)
      .build()
  }

  @Bean
  fun ndmisWriteReferralToCsvStep(
    ndmisReader: HibernateCursorItemReader<Referral>,
    processor: ReferralsProcessor,
    writer: FlatFileItemWriter<ReferralsData>,
  ): Step {
    return stepBuilderFactory.get("ndmisWriteReferralToCsvStep")
      .chunk<Referral, ReferralsData>(chunkSize)
      .reader(ndmisReader)
      .processor(processor)
      .writer(writer)
      .build()
  }

  @Bean
  fun ndmisWriteComplexityToCsvStep(
    ndmisReader: HibernateCursorItemReader<Referral>,
    processor: ComplexityProcessor,
    writer: FlatFileItemWriter<Collection<ComplexityData>>,
  ): Step {
    return stepBuilderFactory.get("ndmisWriteComplexityToCsvStep")
      .chunk<Referral, List<ComplexityData>>(chunkSize)
      .reader(ndmisReader)
      .processor(processor)
      .writer(writer)
      .build()
  }

  @Bean
  fun ndmisWriteAppointmentToCsvStep(
    ndmisReader: HibernateCursorItemReader<Referral>,
    processor: AppointmentProcessor,
    writer: FlatFileItemWriter<Collection<AppointmentData>>,
  ): Step {
    return stepBuilderFactory.get("ndmisWriteAppointmentToCsvStep")
      .chunk<Referral, List<AppointmentData>>(chunkSize)
      .reader(ndmisReader)
      .processor(processor)
      .writer(writer)
      .build()
  }

  private val pushToS3Step = stepBuilderFactory["pushToS3Step"]
    .tasklet { _: StepContribution, _: ChunkContext ->
      listOf(referralReportPath, complexityReportPath, appointmentsReportPath).forEach { path ->
        s3Service.publishFileToS3(ndmisS3Bucket, path, "export/csv/reports/")
        File(path.toString()).delete()
      }
      RepeatStatus.FINISHED
    }
    .build()
}

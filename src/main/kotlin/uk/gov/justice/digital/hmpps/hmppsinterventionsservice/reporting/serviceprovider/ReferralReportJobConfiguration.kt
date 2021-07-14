package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider

import org.springframework.batch.core.Job
import org.springframework.batch.core.Step
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory
import org.springframework.batch.core.configuration.annotation.JobScope
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory
import org.springframework.batch.item.ItemProcessor
import org.springframework.batch.item.data.RepositoryItemReader
import org.springframework.batch.item.data.builder.RepositoryItemReaderBuilder
import org.springframework.batch.item.file.FlatFileItemWriter
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.FileSystemResource
import org.springframework.data.domain.Sort
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceProviderAccessScopeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.BatchUtils
import java.util.Date
import java.util.UUID

@Configuration
@EnableBatchProcessing
class ReferralReportJobConfiguration(
  private val userMapper: UserMapper,
  private val serviceProviderAccessScopeMapper: ServiceProviderAccessScopeMapper,
  private val jobBuilderFactory: JobBuilderFactory,
  private val stepBuilderFactory: StepBuilderFactory,
  private val batchUtils: BatchUtils,
  private val listener: ReferralReportJobListener,
  private val referralRepository: ReferralRepository,
) {
  @Bean
  @JobScope
  fun reader(
    @Value("#{jobParameters['user.id']}") userId: String,
    @Value("#{jobParameters['from']}") from: Date,
    @Value("#{jobParameters['to']}") to: Date,
  ): RepositoryItemReader<UUID> {
    // this reader returns referral IDs which need processing for the report.

    val contracts = serviceProviderAccessScopeMapper.fromUser(userMapper.fromId(userId)).contracts
    return RepositoryItemReaderBuilder<UUID>()
      .name("referralReportReader")
      .repository(referralRepository)
      .methodName("serviceProviderReportReferralIds")
      .arguments(batchUtils.parseDateToOffsetDateTime(from), batchUtils.parseDateToOffsetDateTime(to), contracts)
      .pageSize(1)
      .sorts(mapOf("sentAt" to Sort.Direction.ASC))
      .build()
  }

  @Bean
  @JobScope
  fun writer(@Value("#{jobExecutionContext['output.file.path']}") path: String): FlatFileItemWriter<ReferralReport> {
    return batchUtils.csvFileWriter(
      "referralReportWriter",
      FileSystemResource(path),
      ReferralReport.fields,
      ReferralReport.fields
    )
  }

  @Bean
  fun referralReportJob(writeToCsvStep: Step): Job {
    return jobBuilderFactory["referralReportJob"]
      .listener(listener)
      .start(writeToCsvStep)
      .build()
  }

  @Bean
  fun writeToCsvStep(
    reader: RepositoryItemReader<UUID>,
    processor: ItemProcessor<UUID, ReferralReport>,
    writer: FlatFileItemWriter<ReferralReport>,
  ): Step {
    return stepBuilderFactory["writeToCsvStep"]
      .chunk<UUID, ReferralReport>(5)
      .reader(reader)
      .processor(processor)
      .writer(writer)
      .build()
  }
}

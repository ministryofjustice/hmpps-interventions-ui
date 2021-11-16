package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.apache.commons.csv.CSVFormat
import org.springframework.batch.core.JobParameters
import org.springframework.batch.core.JobParametersBuilder
import org.springframework.batch.core.JobParametersIncrementer
import org.springframework.batch.core.step.skip.SkipPolicy
import org.springframework.batch.item.ItemProcessor
import org.springframework.batch.item.ItemWriter
import org.springframework.batch.item.file.FlatFileHeaderCallback
import org.springframework.batch.item.file.FlatFileItemWriter
import org.springframework.batch.item.file.builder.FlatFileItemWriterBuilder
import org.springframework.batch.item.file.transform.BeanWrapperFieldExtractor
import org.springframework.batch.item.file.transform.ExtractorLineAggregator
import org.springframework.batch.item.file.transform.RecursiveCollectionLineAggregator
import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance.NdmisPerformanceReportJobConfiguration
import java.io.Writer
import java.time.Instant
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.Date

@Component
class BatchUtils {
  private val zoneOffset = ZoneOffset.UTC

  fun parseLocalDateToDate(date: LocalDate): Date {
    // convert the input date into a timestamp zoned in UTC
    // (for converting LocalDates in request params to batch job params
    return Date.from(date.atStartOfDay().atOffset(zoneOffset).toInstant())
  }

  fun parseDateToOffsetDateTime(date: Date): OffsetDateTime {
    // (for converting Dates in batch job params to sql query params)
    return date.toInstant().atOffset(zoneOffset)
  }

  private fun <T> csvFileWriterBase(
    name: String,
    resource: Resource,
    headers: List<String>,
  ): FlatFileItemWriterBuilder<T> {
    return FlatFileItemWriterBuilder<T>()
      .name(name)
      .resource(resource)
      .headerCallback(HeaderWriter(headers.joinToString(",")))
  }

  fun <T> csvFileWriter(
    name: String,
    resource: Resource,
    headers: List<String>,
    fields: List<String>,
  ): FlatFileItemWriter<T> {
    return csvFileWriterBase<T>(name, resource, headers)
      .lineAggregator(CsvLineAggregator(fields))
      .build()
  }

  fun <T> recursiveCollectionCsvFileWriter(
    name: String,
    resource: Resource,
    headers: List<String>,
    fields: List<String>,
  ): FlatFileItemWriter<Collection<T>> {
    return csvFileWriterBase<Collection<T>>(name, resource, headers)
      .lineAggregator(
        RecursiveCollectionLineAggregator<T>().apply {
          setDelegate(CsvLineAggregator(fields))
        }
      ).build()
  }
}

class HeaderWriter(private val header: String) : FlatFileHeaderCallback {
  override fun writeHeader(writer: Writer) {
    writer.write(header)
  }
}

interface SentReferralProcessor<T> : ItemProcessor<Referral, T> {
  companion object : KLogging()

  fun processSentReferral(referral: Referral): T?

  override fun process(referral: Referral): T? {
    logger.debug("processing referral {}", StructuredArguments.kv("referralId", referral.id))
    if (referral.sentAt == null) throw RuntimeException("invalid referral passed to sent referral processor; referral has not been sent")
    return processSentReferral(referral)
  }
}

class LoggingWriter<T> : ItemWriter<T> {
  companion object : KLogging()

  override fun write(items: MutableList<out T>) {
    logger.info(items.toString())
  }
}

class TimestampIncrementer : JobParametersIncrementer {
  override fun getNext(inputParams: JobParameters?): JobParameters {
    val params = inputParams ?: JobParameters()

    if (params.parameters["timestamp"] != null) {
      return params
    }

    return JobParametersBuilder(params)
      .addLong("timestamp", Instant.now().epochSecond)
      .toJobParameters()
  }
}

class NPESkipPolicy : SkipPolicy {
  override fun shouldSkip(t: Throwable, skipCount: Int): Boolean {
    return when (t) {
      is NullPointerException -> {
        NdmisPerformanceReportJobConfiguration.logger.warn("skipping row with unexpected state", t)
        true
      }
      else -> false
    }
  }
}

class CsvLineAggregator<T>(fieldsToExtract: List<String>) : ExtractorLineAggregator<T>() {
  init {
    setFieldExtractor(
      BeanWrapperFieldExtractor<T>().apply {
        setNames(fieldsToExtract.toTypedArray())
        afterPropertiesSet()
      }
    )
  }

  private val csvPrinter = CSVFormat.DEFAULT
    .withRecordSeparator("") // the underlying aggregator adds line separators for us

  override fun doAggregate(fields: Array<out Any>): String {
    val out = StringBuilder()
    csvPrinter.printRecord(out, *fields)
    return out.toString()
  }
}

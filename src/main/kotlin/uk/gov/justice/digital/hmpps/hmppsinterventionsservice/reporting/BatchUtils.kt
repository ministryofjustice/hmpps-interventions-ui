package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.batch.item.ItemProcessor
import org.springframework.batch.item.ItemWriter
import org.springframework.batch.item.file.FlatFileHeaderCallback
import org.springframework.batch.item.file.FlatFileItemWriter
import org.springframework.batch.item.file.builder.FlatFileItemWriterBuilder
import org.springframework.batch.item.file.transform.BeanWrapperFieldExtractor
import org.springframework.batch.item.file.transform.DelimitedLineAggregator
import org.springframework.batch.item.file.transform.RecursiveCollectionLineAggregator
import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.io.Writer
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.*

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

//  fun <T> csvFileWriter(
//    name: String,
//    resource: Resource,
//    headers: List<String>,
//    fields: List<String>,
//  ): FlatFileItemWriter<T> {
//    return FlatFileItemWriterBuilder<T>()
//      .name(name)
//      .resource(resource)
//      .headerCallback(HeaderWriter(headers.joinToString(",")))
//      .delimited()
//      .delimiter(",")
//      .names(*fields.toTypedArray())
//      .build()
//  }
//
//
//
//  fun <T> csvListFileWriter(
//    name: String,
//    resource: Resource,
//    headers: List<String>,
//    fields: List<String>,
//  ): FlatFileItemWriter<Collection<T>> {
//    val csvLineAggregator = DelimitedLineAggregator<T>().apply {
//      setDelimiter(",")
//      setFieldExtractor(BeanWrapperFieldExtractor<T>().apply {
//        setNames(fields.toTypedArray())
//        afterPropertiesSet()
//      })
//    }
//
//    return FlatFileItemWriterBuilder<Collection<T>>()
//      .name(name)
//      .resource(resource)
//      .headerCallback(HeaderWriter(headers.joinToString(",")))
//      .lineAggregator(RecursiveCollectionLineAggregator<T>().apply {
//        setDelegate(csvLineAggregator)
//      })
//      .build()
//  }


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

  private fun <T> csvLineAggregator(fields: List<String>): DelimitedLineAggregator<T> {
    return DelimitedLineAggregator<T>().apply {
      setDelimiter(",")
      setFieldExtractor(BeanWrapperFieldExtractor<T>().apply {
        setNames(fields.toTypedArray())
        afterPropertiesSet()
      })
    }
  }

  fun <T> csvFileWriter(
    name: String,
    resource: Resource,
    headers: List<String>,
    fields: List<String>,
  ): FlatFileItemWriter<T> {
    return csvFileWriterBase<T>(name, resource, headers)
      .lineAggregator(csvLineAggregator(fields))
      .build()
  }

  fun <T> recursiveCollectionCsvFileWriter(
    name: String,
    resource: Resource,
    headers: List<String>,
    fields: List<String>,
  ): FlatFileItemWriter<Collection<T>> {
    return csvFileWriterBase<Collection<T>>(name, resource, headers)
      .lineAggregator(RecursiveCollectionLineAggregator<T>().apply {
        setDelegate(csvLineAggregator(fields))
      }).build()
  }
}

//class ListWriter<T : List<T>> : FlatFileItemWriter<T>() {
//  override fun write(items: MutableList<out T>) {
//    for (subList in items) {
//      super.write(items)
//    }
//  }
//}
//}

  class HeaderWriter(private val header: String) : FlatFileHeaderCallback {
    override fun writeHeader(writer: Writer) {
      writer.write(header)
    }
  }

  class LoggingWriter<T> : ItemWriter<T> {
    companion object : KLogging()

    override fun write(items: MutableList<out T>) {
      logger.info(items.toString())
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

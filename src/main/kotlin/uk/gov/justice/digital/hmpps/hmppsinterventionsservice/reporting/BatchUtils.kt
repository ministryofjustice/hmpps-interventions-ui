package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.batch.item.ItemProcessor
import org.springframework.batch.item.ItemWriter
import org.springframework.batch.item.file.FlatFileHeaderCallback
import org.springframework.batch.item.file.FlatFileItemWriter
import org.springframework.batch.item.file.builder.FlatFileItemWriterBuilder
import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.io.Writer
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

  fun <T> csvFileWriter(
    name: String,
    resource: Resource,
    headers: List<String>,
    fields: List<String>,
  ): FlatFileItemWriter<T> {
    return FlatFileItemWriterBuilder<T>()
      .name(name)
      .resource(resource)
      .headerCallback(HeaderWriter(headers.joinToString(",")))
      .delimited()
      .delimiter(",")
      .names(*fields.toTypedArray())
      .build()
  }
}

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

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting

import com.nhaarman.mockitokotlin2.mock
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.batch.item.ExecutionContext
import org.springframework.core.io.FileSystemResource
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance.NdmisDateTime
import java.io.File
import java.time.Instant
import java.time.LocalDate
import java.time.Month
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.Date
import java.util.UUID
import kotlin.io.path.createTempFile

internal class BatchUtilsTest {
  private val batchUtils = BatchUtils()

  @Test
  fun `parseLocalDateToDate converts LocalDate objects to Date at start of day`() {
    var localDate = LocalDate.of(2024, Month.FEBRUARY, 29)
    val date = batchUtils.parseLocalDateToDate(localDate)

    assertThat(date.toInstant()).isEqualTo(Instant.parse("2024-02-29T00:00:00.00Z"))
  }

  @Test
  fun `parseDateToOffsetDateTime converts Dates to OffsetDateTimes in UTC`() {
    // it doesn't really matter how we format these dates, they are all equivalent
    // (OffsetDateTime is just a more modern representation)
    var date = Date.from(Instant.parse("1999-12-31T23:59:59.99Z"))
    var offsetDateTime = batchUtils.parseDateToOffsetDateTime(date)
    assertThat(offsetDateTime).isEqualTo(OffsetDateTime.parse("2000-01-01T00:59:59.99+01:00"))

    date = Date.from(Instant.parse("1989-02-10T10:00:00.00Z"))
    offsetDateTime = batchUtils.parseDateToOffsetDateTime(date)
    assertThat(offsetDateTime).isEqualTo(OffsetDateTime.parse("1989-02-10T10:00:00.00Z"))
  }

  @Test
  fun `csvFileWriter writes valid csv`() {
    data class Data(
      val stringVal: String,
      val uuidVal: UUID,
    )

    val tmpFile = File(createTempFile().toString())
    try {
      val writer = batchUtils.csvFileWriter<Data>(
        "dataWriter",
        FileSystemResource(tmpFile),
        headers = listOf("string value", "uuid value"),
        fields = listOf("stringVal", "uuidVal"),
      )

      writer.open(mock<ExecutionContext>())
      writer.write(
        listOf(
          Data("tom", UUID.fromString("5863b32b-bb60-4bad-aeee-a15ff61abf3a")),
          Data("andrew", UUID.fromString("cec6b55f-b32f-43af-828b-c72a4c1aade7"))
        )
      )

      assertThat(tmpFile.readText()).isEqualTo(
        """
      string value,uuid value
      tom,5863b32b-bb60-4bad-aeee-a15ff61abf3a
      andrew,cec6b55f-b32f-43af-828b-c72a4c1aade7
      
        """.trimIndent()
      )
    } finally {
      tmpFile.delete()
    }
  }

  @Nested
  inner class CsvLineAggregatorTest {
    private inner class Item(
      val intVal: Int,
      val stringVal: String,
      val nullableListVal: List<String>?,
      val dateTimeVal: NdmisDateTime?,
    )

    private val aggregator = CsvLineAggregator<Item>(
      listOf("intVal", "stringVal", "nullableListVal", "dateTimeVal"),
    )

    @Test
    fun `aggregates null fields`() {
      val item = Item(10, "tom", null, null)
      val result = aggregator.aggregate(item)
      assertThat(result).isEqualTo("10,tom,,")
    }

    @Test
    fun `aggregates NdmisDateTime fields using custom format`() {
      val datetime = OffsetDateTime.of(2020, 11, 17, 13, 30, 0, 0, ZoneOffset.ofHours(8))
      val item = Item(10, "tom", null, NdmisDateTime(datetime))
      val result = aggregator.aggregate(item)
      assertThat(result).isEqualTo("10,tom,,2020-11-17 05:30:00.000000+00")
    }

    @Test
    fun `aggregates all fields correctly, even lists or strings with commas in`() {
      val item = Item(10, "tom, tom, tom", listOf("a", "b", "c"), null)
      val result = aggregator.aggregate(item)
      assertThat(result).isEqualTo("10,\"tom, tom, tom\",\"[a, b, c]\",")
    }

    @Test
    fun `aggregates fields containing quotes`() {
      val item = Item(10, "something \"quoted\"", null, null)
      val result = aggregator.aggregate(item)
      assertThat(result).isEqualTo("10,\"something \"\"quoted\"\"\",,")
    }

    @Test
    fun `aggregates fields containing newlines and tabs`() {
      val item = Item(10, "all types\nof\r\nnewline\tand tab", null, null)
      val result = aggregator.aggregate(item)
      assertThat(result).isEqualTo("10,\"all types\nof\r\nnewline\tand tab\",,")
    }
  }
}

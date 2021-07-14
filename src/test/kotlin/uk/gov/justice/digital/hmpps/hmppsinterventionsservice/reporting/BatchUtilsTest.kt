package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting

import com.nhaarman.mockitokotlin2.mock
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.batch.item.ExecutionContext
import org.springframework.core.io.FileSystemResource
import java.io.File
import java.time.Instant
import java.time.OffsetDateTime
import java.util.Date
import java.util.UUID
import kotlin.io.path.createTempFile

internal class BatchUtilsTest {
  private val batchUtils = BatchUtils()

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
}

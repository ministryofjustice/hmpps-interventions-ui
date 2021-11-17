package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance.NdmisDateTime
import java.time.OffsetDateTime

internal class NdmisDateTimeTest {
  private val summerTimeInLondon = OffsetDateTime.parse("2021-08-09T12:34:56.123456+01:00")
  private val winterTimeInLondon = OffsetDateTime.parse("2021-11-17T12:01:49+00:00")

  @Test
  fun `formats local timestamps as psql did to retain existing mapping in NDMIS reports`() {
    assertThat(NdmisDateTime(summerTimeInLondon).toString()).isEqualTo("2021-08-09 11:34:56.123456+00")
    assertThat(NdmisDateTime(winterTimeInLondon).toString()).isEqualTo("2021-11-17 12:01:49.000000+00")
  }
}

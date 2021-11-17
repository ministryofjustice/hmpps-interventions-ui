package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

// Agreement: the v2 NDMIS report uses this format, v3 switches to proper ISO8601
// Deadline: stop producing v2 format after 13 December 2021
data class NdmisDateTime(val dateTime: OffsetDateTime) {
  override fun toString(): String {
    return dateTime.atZoneSameInstant(ZoneOffset.UTC)
      .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS+00"))
  }
}

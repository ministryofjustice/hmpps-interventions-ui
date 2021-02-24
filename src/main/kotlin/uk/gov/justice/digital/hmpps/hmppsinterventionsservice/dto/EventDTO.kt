package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import java.time.OffsetDateTime

data class EventDTO(
  val eventType: String,
  val description: String,
  val detailUrl: String,
  val occurredAt: OffsetDateTime,
  val additionalInformation: Map<String, Any>
) {
  val version: Int = 1
}

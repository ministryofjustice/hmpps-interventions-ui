package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider

import java.time.OffsetDateTime
import java.util.UUID
import kotlin.reflect.full.memberProperties

data class ReferralReport(
  val id: UUID,
  val referralReference: String,
  val serviceUserCRN: String,
  val dateReferralReceived: OffsetDateTime,
  val contractReference: String,
  val organisationId: String,
) {
  companion object {
    val fields = ReferralReport::class.memberProperties.map { it.name }.sorted()
  }
}

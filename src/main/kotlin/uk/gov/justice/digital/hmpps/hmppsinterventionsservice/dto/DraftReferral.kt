package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

data class DraftReferral(
  val id: UUID? = null,
  val created: OffsetDateTime? = null,
  val completionDeadline: LocalDate? = null
) {
  constructor(referral: Referral) : this(
    referral.id!!,
    referral.created!!,
    referral.completionDeadline,
  )
}

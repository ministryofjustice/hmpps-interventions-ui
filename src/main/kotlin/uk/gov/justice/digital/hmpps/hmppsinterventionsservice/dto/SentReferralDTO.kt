package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

class SentReferralDTO(
  val id: UUID,
  val sentAt: OffsetDateTime,
  val referenceNumber: String,
  val referral: DraftReferralDTO,
) {
  companion object {
    fun from(referral: Referral): SentReferralDTO {
      return SentReferralDTO(
        id = referral.id!!,
        sentAt = referral.sentAt!!,
        referenceNumber = referral.referenceNumber!!,
        referral = DraftReferralDTO.from(referral),
      )
    }
  }
}

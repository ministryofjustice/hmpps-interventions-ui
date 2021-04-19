package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

class EndedReferralDTO(
  val id: UUID,
  val endedAt: OffsetDateTime,
  val endedBy: AuthUserDTO,
  val referenceNumber: String,
  val assignedTo: AuthUserDTO?,
  val referral: DraftReferralDTO,
  val cancellationReason: String
) {
  companion object {
    fun from(referral: Referral): EndedReferralDTO {
      return EndedReferralDTO(
        id = referral.id,
        endedAt = referral.endedAt!!,
        endedBy = AuthUserDTO.from(referral.endedBy!!),
        referenceNumber = referral.referenceNumber!!,
        assignedTo = referral.assignedTo?.let { AuthUserDTO.from(it) },
        referral = DraftReferralDTO.from(referral),
        cancellationReason = referral.cancellationReason!!.id
      )
    }
  }
}

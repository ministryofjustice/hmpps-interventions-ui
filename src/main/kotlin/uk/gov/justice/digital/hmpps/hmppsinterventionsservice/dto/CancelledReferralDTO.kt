package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

class CancelledReferralDTO(
  val id: UUID,
  val cancelledAt: OffsetDateTime,
  val cancelledBy: AuthUserDTO,
  val referenceNumber: String,
  val assignedTo: AuthUserDTO?,
  val referral: DraftReferralDTO,
  ) {
    companion object {
      fun from(referral: Referral): CancelledReferralDTO {
        return CancelledReferralDTO(
          id = referral.id,
          cancelledAt = referral.cancelledAt!!,
          cancelledBy = AuthUserDTO.from(referral.cancelledBy!!),
          referenceNumber = referral.referenceNumber!!,
          assignedTo = referral.assignedTo?.let { AuthUserDTO.from(it) },
          referral = DraftReferralDTO.from(referral),
        )
      }
    }
  }
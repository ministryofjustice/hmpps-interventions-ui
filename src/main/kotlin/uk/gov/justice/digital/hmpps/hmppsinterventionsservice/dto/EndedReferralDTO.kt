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
  val cancellationReason: String,
  val cancellationComments: String?,
  val endOfServiceReport: EndOfServiceReportDTO?
) {
  companion object {
    fun from(referral: Referral): EndedReferralDTO {
      return EndedReferralDTO(
        id = referral.id,
        endedAt = referral.endRequestedAt!!,
        endedBy = AuthUserDTO.from(referral.endRequestedBy!!),
        referenceNumber = referral.referenceNumber!!,
        assignedTo = referral.assignedTo?.let { AuthUserDTO.from(it) },
        referral = DraftReferralDTO.from(referral),
        cancellationReason = referral.endRequestedReason!!.description,
        cancellationComments = referral.endRequestedComments,
        endOfServiceReport = referral.endOfServiceReport?.let { EndOfServiceReportDTO.from(it) }
      )
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralForDashboard
import java.time.OffsetDateTime
import java.util.UUID

data class SentReferralSummaryForDashboardDTO(
  val id: UUID,
  val sentAt: OffsetDateTime,
  val sentBy: AuthUserDTO,
  val referenceNumber: String,
  val assignedTo: AuthUserDTO?,
  val serviceUser: ServiceUserDTO?,
  val serviceProvider: ServiceProviderDTO?,
  val supplementaryRiskId: UUID,
  val interventionTitle: String,
  val concludedAt: OffsetDateTime?
) {
  companion object {
    fun from(referral: ReferralForDashboard): SentReferralSummaryForDashboardDTO {
      return SentReferralSummaryForDashboardDTO(
        id = referral.id,
        sentAt = referral.sentAt!!,
        sentBy = AuthUserDTO.from(referral.sentBy!!),
        referenceNumber = referral.referenceNumber!!,
        assignedTo = referral.currentAssignee?.let { AuthUserDTO.from(it) },
        serviceUser = ServiceUserDTO.from(referral.serviceUserCRN, referral.serviceUserData),
        serviceProvider = ServiceProviderDTO.from(referral.intervention.dynamicFrameworkContract.primeProvider),
        supplementaryRiskId = referral.supplementaryRiskId!!,
        interventionTitle = referral.intervention.title,
        concludedAt = referral.concludedAt
      )
    }
  }
}

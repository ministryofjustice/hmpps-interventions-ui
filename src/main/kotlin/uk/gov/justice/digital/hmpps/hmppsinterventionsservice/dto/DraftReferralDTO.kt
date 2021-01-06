package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

data class DraftReferralDTO(
  val id: UUID? = null,
  val created: OffsetDateTime? = null,
  val completionDeadline: LocalDate? = null,
  val serviceCategoryId: UUID? = null,
  val complexityLevelId: UUID? = null,
  val furtherInformation: String? = null,
  val additionalNeedsInformation: String? = null,
  val accessibilityNeeds: String? = null,
  val needsInterpreter: Boolean? = null,
  val interpreterLanguage: String? = null,
  val hasAdditionalResponsibilities: Boolean? = null,
  val whenUnavailable: String? = null,
  val additionalRiskInformation: String? = null,
  val usingRarDays: Boolean? = null,
  val maximumRarDays: Int? = null
) {
  companion object {
    fun from(referral: Referral): DraftReferralDTO {
      return DraftReferralDTO(
        referral.id!!,
        referral.created!!,
        referral.completionDeadline,
        referral.serviceCategoryID,
        referral.complexityLevelID,
        referral.furtherInformation,
        referral.additionalNeedsInformation,
        referral.accessibilityNeeds,
        referral.needsInterpreter,
        referral.interpreterLanguage,
        referral.hasAdditionalResponsibilities,
        referral.whenUnavailable,
        referral.additionalRiskInformation,
        referral.usingRarDays,
        referral.maximumRarDays
      )
    }
  }
}

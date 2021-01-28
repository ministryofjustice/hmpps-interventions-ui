package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

data class DraftReferralDTO(
  val id: UUID? = null,
  val createdAt: OffsetDateTime? = null,
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
  val maximumRarDays: Int? = null,
  val desiredOutcomesIds: List<UUID>? = null,
  val serviceUser: ServiceUserDTO? = null,
) {
  companion object {
    fun from(referral: Referral): DraftReferralDTO {
      return DraftReferralDTO(
        id = referral.id!!,
        createdAt = referral.createdAt!!,
        completionDeadline = referral.completionDeadline,
        serviceCategoryId = referral.serviceCategoryID,
        complexityLevelId = referral.complexityLevelID,
        furtherInformation = referral.furtherInformation,
        additionalNeedsInformation = referral.additionalNeedsInformation,
        accessibilityNeeds = referral.accessibilityNeeds,
        needsInterpreter = referral.needsInterpreter,
        interpreterLanguage = referral.interpreterLanguage,
        hasAdditionalResponsibilities = referral.hasAdditionalResponsibilities,
        whenUnavailable = referral.whenUnavailable,
        additionalRiskInformation = referral.additionalRiskInformation,
        usingRarDays = referral.usingRarDays,
        maximumRarDays = referral.maximumRarDays,
        desiredOutcomesIds = referral.desiredOutcomesIDs,
        serviceUser = ServiceUserDTO.from(referral.serviceUserCRN, referral.serviceUserData),
      )
    }
  }
}

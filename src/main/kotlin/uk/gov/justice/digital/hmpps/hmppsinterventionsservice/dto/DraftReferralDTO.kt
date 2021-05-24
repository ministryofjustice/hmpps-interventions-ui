package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

data class ReferralComplexityLevel(
  val serviceCategoryId: UUID,
  val complexityLevelId: UUID,
)

data class DraftReferralDTO(
  val id: UUID? = null,
  val createdAt: OffsetDateTime? = null,
  val completionDeadline: LocalDate? = null,
  val serviceCategoryId: UUID? = null,
  val serviceCategoryIds: List<UUID>? = null,
  val complexityLevels: List<ReferralComplexityLevel>? = null,
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
  val desiredOutcomes: List<SelectedDesiredOutcomesDTO>? = null,
  val serviceUser: ServiceUserDTO? = null,
  val serviceProvider: ServiceProviderDTO? = null,
  val relevantSentenceId: Long? = null,
  val interventionId: UUID? = null,
) {
  companion object {
    fun from(referral: Referral): DraftReferralDTO {
      val contract = referral.intervention.dynamicFrameworkContract
      return DraftReferralDTO(
        id = referral.id,
        createdAt = referral.createdAt,
        completionDeadline = referral.completionDeadline,
        complexityLevels = referral.complexityLevelIds?.map { ReferralComplexityLevel(it.key, it.value) },
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
        desiredOutcomes = referral.selectedDesiredOutcomes?.groupBy { it.serviceCategoryId }?.map { (serviceCategoryId, desiredoutcomes) -> SelectedDesiredOutcomesDTO(serviceCategoryId, desiredoutcomes.map { it.desiredOutcomeId }) },
        serviceUser = ServiceUserDTO.from(referral.serviceUserCRN, referral.serviceUserData),
        serviceProvider = ServiceProviderDTO.from(contract.primeProvider),
        relevantSentenceId = referral.relevantSentenceId,
        // TODO: remove this once cohort referrals changes are complete
        serviceCategoryId = if (referral.selectedServiceCategories?.isNotEmpty() == true) referral.selectedServiceCategories!!.elementAt(0).id else null,
        serviceCategoryIds = referral.selectedServiceCategories?.map { it.id },
        interventionId = referral.intervention.id,
      )
    }
  }
}

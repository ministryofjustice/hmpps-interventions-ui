package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

data class DraftReferralFields(
  val completionDeadline: LocalDate? = null,
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
  val relevantSentenceId: Long? = null,
)

data class SentReferralFields(
  val sentAt: OffsetDateTime,
  val sentBy: AuthUserDTO,
  val referenceNumber: String,
  val assignedTo: AuthUserDTO?,
  val actionPlanId: UUID?,
  val endOfServiceReport: EndOfServiceReportDTO?,
)

data class EndedReferralFields(
  val endedAt: OffsetDateTime,
  val endedBy: AuthUserDTO,
  val cancellationReason: String,
  val cancellationComments: String?,
)

data class ReferralDTO(
  val id: UUID,
  val createdAt: OffsetDateTime,
  val serviceUser: ServiceUserDTO,
  val serviceCategory: ServiceCategoryDTO,
  val serviceProvider: ServiceProviderDTO,

  val draftReferralFields: DraftReferralFields,
  var sentReferralFields: SentReferralFields? = null,
  var endedReferralFields: EndedReferralFields? = null,
) {
  companion object {
    fun from(referral: Referral): ReferralDTO {
      val contract = referral.intervention.dynamicFrameworkContract

      val referralDTO = ReferralDTO(
        id = referral.id,
        createdAt = referral.createdAt,
        serviceUser = ServiceUserDTO.from(referral.serviceUserCRN, referral.serviceUserData),
        serviceCategory = ServiceCategoryDTO.from(contract.serviceCategory),
        serviceProvider = ServiceProviderDTO.from(contract.serviceProvider),

        draftReferralFields = DraftReferralFields(
          completionDeadline = referral.completionDeadline,
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
          relevantSentenceId = referral.relevantSentenceId,
        )
      )

      referral.sentAt?.let {
        referralDTO.sentReferralFields = SentReferralFields(
          sentAt = it,
          sentBy = AuthUserDTO.from(referral.sentBy!!),
          referenceNumber = referral.referenceNumber!!,
          assignedTo = referral.assignedTo?.let { user -> AuthUserDTO.from(user) },
          actionPlanId = referral.actionPlan?.id,
          endOfServiceReport = referral.endOfServiceReport?.let { report -> EndOfServiceReportDTO.from(report) }
        )
      }

      referral.endedAt?.let {
        referralDTO.endedReferralFields = EndedReferralFields(
          endedAt = it,
          endedBy = AuthUserDTO.from(referral.endedBy!!),
          cancellationReason = referral.cancellationReason!!.description,
          cancellationComments = referral.cancellationComments,
        )
      }

      return referralDTO
    }
  }
}

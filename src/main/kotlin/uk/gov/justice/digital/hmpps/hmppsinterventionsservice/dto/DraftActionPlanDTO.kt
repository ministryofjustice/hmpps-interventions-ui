package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import java.time.OffsetDateTime
import java.util.UUID

data class DraftActionPlanDTO(
  override val id: UUID,
  override val referralId: UUID,
  override val numberOfSessions: Int?,
  override val activities: List<ActionPlanActivityDTO> = emptyList(),
  val createdBy: AuthUserDTO,
  val createdAt: OffsetDateTime
) : BaseActionPlanDTO(id, referralId, numberOfSessions, activities) {
  companion object {
    fun from(actionPlan: ActionPlan): DraftActionPlanDTO {
      return DraftActionPlanDTO(
        id = actionPlan.id,
        referralId = actionPlan.referral.id,
        numberOfSessions = actionPlan.numberOfSessions,
        activities = actionPlan.activities.map { ActionPlanActivityDTO.from(it) },
        createdBy = AuthUserDTO.from(actionPlan.createdBy),
        createdAt = actionPlan.createdAt,
      )
    }
  }
}

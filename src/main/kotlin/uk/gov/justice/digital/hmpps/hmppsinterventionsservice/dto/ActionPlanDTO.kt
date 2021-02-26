package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import java.time.OffsetDateTime
import java.util.UUID

abstract class BaseActionPlanDTO(
  open val id: UUID,
  open val referralId: UUID,
  open val numberOfSessions: Int?,
  open val activities: List<ActionPlanActivityDTO> = emptyList(),
)

data class ActionPlanDTO(
  override val id: UUID,
  override val referralId: UUID,
  override val numberOfSessions: Int?,
  override val activities: List<ActionPlanActivityDTO> = emptyList(),
  val createdBy: AuthUserDTO,
  val createdAt: OffsetDateTime,
  val submittedBy: AuthUserDTO?,
  val submittedAt: OffsetDateTime?
) : BaseActionPlanDTO(id, referralId, numberOfSessions, activities) {
  companion object {
    fun from(actionPlan: ActionPlan): ActionPlanDTO {
      return ActionPlanDTO(
        id = actionPlan.id,
        referralId = actionPlan.referral.id,
        numberOfSessions = actionPlan.numberOfSessions,
        activities = actionPlan.activities.map { ActionPlanActivityDTO.from(it) },
        createdBy = AuthUserDTO.from(actionPlan.createdBy),
        createdAt = actionPlan.createdAt,
        submittedBy = actionPlan.submittedBy?.let { AuthUserDTO.from(actionPlan.submittedBy!!) },
        submittedAt = actionPlan.submittedAt,
      )
    }
  }
}

data class ActionPlanActivityDTO(
  val desiredOutcome: DesiredOutcomeDTO,
  val description: String,
  val createdAt: OffsetDateTime
) {
  companion object {
    fun from(actionPlanActivity: ActionPlanActivity): ActionPlanActivityDTO {
      return ActionPlanActivityDTO(
        desiredOutcome = DesiredOutcomeDTO(actionPlanActivity.desiredOutcome.id, actionPlanActivity.desiredOutcome.description),
        description = actionPlanActivity.description,
        createdAt = actionPlanActivity.createdAt,
      )
    }
  }
}

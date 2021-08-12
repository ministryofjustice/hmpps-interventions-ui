package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import java.time.OffsetDateTime
import java.util.UUID

data class ActionPlanDTO(
  val id: UUID,
  val referralId: UUID,
  val numberOfSessions: Int?,
  val activities: List<ActionPlanActivityDTO> = emptyList(),
  val createdBy: AuthUserDTO,
  val createdAt: OffsetDateTime,
  val submittedBy: AuthUserDTO?,
  val submittedAt: OffsetDateTime?,
  val approvedBy: AuthUserDTO?,
  val approvedAt: OffsetDateTime?
) {
  companion object {
    fun from(actionPlan: ActionPlan): ActionPlanDTO {
      return ActionPlanDTO(
        id = actionPlan.id,
        referralId = actionPlan.referral.id,
        numberOfSessions = actionPlan.numberOfSessions,
        activities = actionPlan.activities.map { ActionPlanActivityDTO.from(it) },
        createdBy = AuthUserDTO.from(actionPlan.createdBy),
        createdAt = actionPlan.createdAt,
        submittedBy = actionPlan.submittedBy?.let { AuthUserDTO.from(it) },
        submittedAt = actionPlan.submittedAt,
        approvedBy = actionPlan.approvedBy?.let { AuthUserDTO.from(it) },
        approvedAt = actionPlan.approvedAt,
      )
    }
  }
}

data class ActionPlanActivityDTO(
  val id: UUID,
  val description: String,
  val createdAt: OffsetDateTime
) {
  companion object {
    fun from(actionPlanActivity: ActionPlanActivity): ActionPlanActivityDTO {
      return ActionPlanActivityDTO(
        id = actionPlanActivity.id,
        description = actionPlanActivity.description,
        createdAt = actionPlanActivity.createdAt
      )
    }
  }
}

data class CreateActionPlanDTO(
  val referralId: UUID,
  val numberOfSessions: Int?,
  val activities: List<UpdateActionPlanActivityDTO> = emptyList()
)

data class UpdateActionPlanDTO(
  val numberOfSessions: Int?,
  val newActivity: UpdateActionPlanActivityDTO?
)

data class UpdateActionPlanActivityDTO(
  val description: String,
)

data class ActionPlanSummaryDTO(
  val id: UUID,
  val approvedAt: OffsetDateTime?,
) {
  companion object {
    fun from(actionPlan: ActionPlan): ActionPlanSummaryDTO {
      return ActionPlanSummaryDTO(
        id = actionPlan.id,
        approvedAt = actionPlan.approvedAt,
      )
    }
    fun from(actionPlans: List<ActionPlan>): List<ActionPlanSummaryDTO> {
      return actionPlans.map { from(it) }
    }
  }
}

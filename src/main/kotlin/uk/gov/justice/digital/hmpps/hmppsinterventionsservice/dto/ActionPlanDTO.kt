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
  val desiredOutcome: DesiredOutcomeDTO,
  val description: String,
  val createdAt: OffsetDateTime
) {
  companion object {
    fun from(actionPlanActivity: ActionPlanActivity): ActionPlanActivityDTO {
      return ActionPlanActivityDTO(
        id = actionPlanActivity.id,
        desiredOutcome = DesiredOutcomeDTO.from(actionPlanActivity.desiredOutcome),
        description = actionPlanActivity.description,
        createdAt = actionPlanActivity.createdAt
      )
    }
  }
}

data class UpdateActionPlanActivityDTO(
  val description: String?,
)

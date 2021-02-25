package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import java.time.OffsetDateTime
import java.util.UUID

data class DraftActionPlanDTO(
  val id: UUID,
  val referralId: UUID,
  val numberOfSessions: Int?,
  val activities: List<DraftActionPlanActivityDTO> = emptyList(),
  val createdBy: AuthUserDTO,
  val createdAt: OffsetDateTime
) {
  companion object {
    fun from(actionPlan: ActionPlan): DraftActionPlanDTO {
      return DraftActionPlanDTO(
        id = actionPlan.id,
        referralId = actionPlan.referral.id,
        numberOfSessions = actionPlan.numberOfSessions,
        activities = actionPlan.activities.map { DraftActionPlanActivityDTO.from(it) },
        createdBy = AuthUserDTO.from(actionPlan.createdBy),
        createdAt = actionPlan.createdAt,
      )
    }
  }
}

data class DraftActionPlanActivityDTO(
  val desiredOutcome: DesiredOutcomeDTO,
  val description: String,
  val createdAt: OffsetDateTime
) {
  companion object {
    fun from(actionPlanActivity: ActionPlanActivity): DraftActionPlanActivityDTO {
      return DraftActionPlanActivityDTO(
        desiredOutcome = DesiredOutcomeDTO(actionPlanActivity.desiredOutcome.id, actionPlanActivity.desiredOutcome.description),
        description = actionPlanActivity.description,
        createdAt = actionPlanActivity.createdAt,
      )
    }
  }
}

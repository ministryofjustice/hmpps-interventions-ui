package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AuthUserDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DesiredOutcomeDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository

@Component
class ActionPlanMapper(
  val desiredOutcomeRepository: DesiredOutcomeRepository
) {

  fun map(activities: List<CreateActionPlanActivityDTO>): List<ActionPlanActivity> {

    return activities.map {
      ActionPlanActivity(
        desiredOutcome = desiredOutcomeRepository.getOne(it.desiredOutcome.id),
        description = it.description,
        createdAt = it.createdAt
      )
    }
  }

  fun map(actionPlan: ActionPlan): DraftActionPlanDTO {

    val createdByAuthUser = actionPlan.createdBy
    return DraftActionPlanDTO(
      id = actionPlan.id,
      referralId = actionPlan.referral.id,
      numberOfSessions = actionPlan.numberOfSessions,
      createdBy = AuthUserDTO.from(actionPlan.createdBy),
      createdAt = actionPlan.createdAt,
      activities = actionPlan.activities.map {
        DraftActionPlanActivityDTO(
          desiredOutcome = DesiredOutcomeDTO(it.desiredOutcome.id, it.desiredOutcome.description),
          description = it.description,
          createdAt = it.createdAt
        )
      }
    )
  }
}

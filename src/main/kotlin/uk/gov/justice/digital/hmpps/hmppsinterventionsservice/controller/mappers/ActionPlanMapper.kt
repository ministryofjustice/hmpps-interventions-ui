package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.util.UUID

@Component
class ActionPlanMapper(
  val desiredOutcomeRepository: DesiredOutcomeRepository,
  val referralRepository: ReferralRepository,
) {

  fun mapActionPlanActivityDtoToActionPlanActivity(activities: List<CreateActionPlanActivityDTO>): List<ActionPlanActivity> {
    return activities.map {
      val desiredOutcomeId = it.desiredOutcome.id
      ActionPlanActivity(
        desiredOutcome = desiredOutcomeRepository.findById(desiredOutcomeId).orElseThrow {
          throw ResponseStatusException(NOT_FOUND, "desired outcome not found [id=$desiredOutcomeId]")
        },
        description = it.description,
        createdAt = it.createdAt
      )
    }
  }

  fun mapActionPlanDtoToActionPlan(actionPlanId: UUID, updateActionPlan: DraftActionPlanDTO): ActionPlan {
    return ActionPlan(
      id = actionPlanId,
      numberOfSessions = updateActionPlan.numberOfSessions,
      createdBy = AuthUser(
        id = updateActionPlan.createdBy.userId,
        authSource = updateActionPlan.createdBy.authSource,
        userName = updateActionPlan.createdBy.username,
      ),
      createdAt = updateActionPlan.createdAt,
      referral = referralRepository.findById(updateActionPlan.referralId).orElseThrow {
        throw ResponseStatusException(NOT_FOUND, "referral not found [id=${updateActionPlan.referralId}]")
      },
      activities = updateActionPlan.activities.map {
        ActionPlanActivity(
          desiredOutcome = desiredOutcomeRepository.findById(it.desiredOutcome.id).orElseThrow {
            throw ResponseStatusException(NOT_FOUND, "desired outcome not found [id=${it.desiredOutcome.id}]")
          },
          description = it.description,
          createdAt = it.createdAt
        )
      }
    )
  }
}

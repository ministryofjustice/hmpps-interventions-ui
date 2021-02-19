package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AuthUserDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DesiredOutcomeDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.UUID

@Component
class ActionPlanMapper(
  val referralRepository: ReferralRepository,
  val desiredOutcomeRepository: DesiredOutcomeRepository
) {

  fun map(createActionPlanDTO: CreateActionPlanDTO, authUser: AuthUser): ActionPlan {

    val activityPlanId = UUID.randomUUID()
    return ActionPlan(
      id = activityPlanId,
      numberOfSessions = createActionPlanDTO.numberOfSessions,
      createdBy = authUser,
      createdAt = OffsetDateTime.now(),
      referral = referralRepository.getOne(createActionPlanDTO.referralId),
      activities = createActionPlanDTO.activities.map {
        ActionPlanActivity(
          desiredOutcome = desiredOutcomeRepository.getOne(it.desiredOutcome.id),
          description = it.description,
          createdAt = it.createdAt
        )
      }
    )
  }

  fun map(actionPlan: ActionPlan): DraftActionPlanDTO {

    val createdByAuthUser = actionPlan.createdBy
    return DraftActionPlanDTO(
      id = actionPlan.id,
      referralId = actionPlan.referral.id,
      numberOfSessions = actionPlan.numberOfSessions,
      createdBy = AuthUserDTO(createdByAuthUser.id, createdByAuthUser.authSource),
      createdAt = OffsetDateTime.now(),
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

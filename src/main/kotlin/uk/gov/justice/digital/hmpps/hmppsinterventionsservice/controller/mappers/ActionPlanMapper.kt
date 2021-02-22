package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
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
}

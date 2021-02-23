package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository

@Component
class ActionPlanMapper(
  val desiredOutcomeRepository: DesiredOutcomeRepository
) {

  fun map(activities: List<CreateActionPlanActivityDTO>): List<ActionPlanActivity> {

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
}

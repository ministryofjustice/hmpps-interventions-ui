package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository

@Component
class ActionPlanMapper(
  val desiredOutcomeRepository: DesiredOutcomeRepository,
  val referralRepository: ReferralRepository,
) {

  fun mapActionPlanActivityDtoToActionPlanActivity(activities: List<CreateActionPlanActivityDTO>): List<ActionPlanActivity> {
    return activities.map {
      mapActionPlanActivityDtoToActionPlanActivity(it)
    }
  }

  fun mapActionPlanActivityDtoToActionPlanActivity(activity: CreateActionPlanActivityDTO): ActionPlanActivity {
    val desiredOutcomeId = activity.desiredOutcomeId
    return ActionPlanActivity(
      desiredOutcome = desiredOutcomeRepository.findById(desiredOutcomeId).orElseThrow {
        throw ResponseStatusException(NOT_FOUND, "desired outcome not found [id=$desiredOutcomeId]")
      },
      description = activity.description
    )
  }
}

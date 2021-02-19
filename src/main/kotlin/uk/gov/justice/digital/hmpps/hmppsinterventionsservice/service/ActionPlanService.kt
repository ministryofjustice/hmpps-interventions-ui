package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository

@Service
class ActionPlanService(
  val authUserRepository: AuthUserRepository,
  val actionPlanRepository: ActionPlanRepository
) {

  fun createDraftReferral(actionPlan: ActionPlan): ActionPlan {

    val draftActionPlan = actionPlan.copy(
      createdBy = authUserRepository.save(actionPlan.createdBy)
    )

    return actionPlanRepository.save(draftActionPlan)
  }
}

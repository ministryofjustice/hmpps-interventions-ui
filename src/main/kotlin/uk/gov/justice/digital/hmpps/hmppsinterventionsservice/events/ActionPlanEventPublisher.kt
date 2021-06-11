package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ActionPlanController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan

enum class ActionPlanEventType {
  SUBMITTED,
  APPROVED,
}

class ActionPlanEvent(source: Any, val type: ActionPlanEventType, val actionPlan: ActionPlan, val detailUrl: String) : ApplicationEvent(source) {
  override fun toString(): String {
    return "ActionPlanEvent(type=$type, actionPlanId=${actionPlan.id}, detailUrl='$detailUrl', source=$source)"
  }
}

@Component
class ActionPlanEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {

  fun actionPlanSubmitEvent(actionPlan: ActionPlan) {
    applicationEventPublisher.publishEvent(ActionPlanEvent(this, ActionPlanEventType.SUBMITTED, actionPlan, createDetailUrl(actionPlan)))
  }

  fun actionPlanApprovedEvent(actionPlan: ActionPlan) {
    applicationEventPublisher.publishEvent(ActionPlanEvent(this, ActionPlanEventType.APPROVED, actionPlan, createDetailUrl(actionPlan)))
  }

  private fun createDetailUrl(actionPlan: ActionPlan): String {
    val path = locationMapper.getPathFromControllerMethod(ActionPlanController::getActionPlan)
    return locationMapper.expandPathToCurrentRequestBaseUrl(path, actionPlan.id).toString()
  }
}

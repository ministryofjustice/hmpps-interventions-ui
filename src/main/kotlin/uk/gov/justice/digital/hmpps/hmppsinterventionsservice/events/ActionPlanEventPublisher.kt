package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ActionPlanController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import kotlin.reflect.KFunction

enum class ActionPlanEventType {
  SUBMITTED,
}

class ActionPlanEvent(source: Any, val type: ActionPlanEventType, val actionPlan: ActionPlan, val detailUrl: String) : ApplicationEvent(source)

@Component
class ActionPlanEventPublisher(private val applicationEventPublisher: ApplicationEventPublisher) {

  fun actionPlanSubmitEvent(actionPlan: ActionPlan) {
    applicationEventPublisher.publishEvent(ActionPlanEvent(this, ActionPlanEventType.SUBMITTED, actionPlan, createDetailUrl(actionPlan)))
  }

  private fun createDetailUrl(ActionPlan: ActionPlan): String {
    val method = ActionPlanController::getActionPlan as KFunction<*>
    val path = method.annotations.filterIsInstance<GetMapping>().first().value.first()

    return ServletUriComponentsBuilder
      .fromCurrentContextPath()
      .path(path)
      .buildAndExpand(ActionPlan.id)
      .toUriString()
  }
}

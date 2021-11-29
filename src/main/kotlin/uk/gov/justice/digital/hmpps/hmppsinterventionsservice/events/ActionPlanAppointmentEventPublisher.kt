package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.DeliverySessionController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DeliverySession

enum class ActionPlanAppointmentEventType {
  ATTENDANCE_RECORDED,
  BEHAVIOUR_RECORDED,
  SESSION_FEEDBACK_RECORDED,
}

class ActionPlanAppointmentEvent(source: Any, val type: ActionPlanAppointmentEventType, val deliverySession: DeliverySession, val detailUrl: String, val notifyPP: Boolean) : ApplicationEvent(source) {
  override fun toString(): String {
    return "ActionPlanAppointmentEvent(type=$type, deliverySessionId=${deliverySession.id}, detailUrl='$detailUrl', source=$source)"
  }
}

@Component
class ActionPlanAppointmentEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {
  fun attendanceRecordedEvent(session: DeliverySession, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      ActionPlanAppointmentEvent(this, ActionPlanAppointmentEventType.ATTENDANCE_RECORDED, session, getAppointmentURL(session), notifyPP)
    )
  }

  fun behaviourRecordedEvent(session: DeliverySession, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      ActionPlanAppointmentEvent(this, ActionPlanAppointmentEventType.BEHAVIOUR_RECORDED, session, getAppointmentURL(session), notifyPP)
    )
  }

  fun sessionFeedbackRecordedEvent(session: DeliverySession, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      ActionPlanAppointmentEvent(this, ActionPlanAppointmentEventType.SESSION_FEEDBACK_RECORDED, session, getAppointmentURL(session), notifyPP)
    )
  }

  private fun getAppointmentURL(session: DeliverySession): String {
    val path = locationMapper.getPathFromControllerMethod(DeliverySessionController::getSessionForReferralId)
    return locationMapper.expandPathToCurrentContextPathUrl(path, session.referral.id, session.sessionNumber).toString()
  }
}

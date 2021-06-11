package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ActionPlanSessionController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession

enum class AppointmentEventType {
  ATTENDANCE_RECORDED,
  BEHAVIOUR_RECORDED,
  SESSION_FEEDBACK_RECORDED,
}

class AppointmentEvent(source: Any, val type: AppointmentEventType, val actionPlanSession: ActionPlanSession, val detailUrl: String, val notifyPP: Boolean) : ApplicationEvent(source) {
  override fun toString(): String {
    return "AppointmentEvent(type=$type, appointment=${actionPlanSession.id}, detailUrl='$detailUrl', source=$source)"
  }
}

@Component
class AppointmentEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {
  fun attendanceRecordedEvent(session: ActionPlanSession, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.ATTENDANCE_RECORDED, session, getAppointmentURL(session), notifyPP)
    )
  }

  fun behaviourRecordedEvent(session: ActionPlanSession, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.BEHAVIOUR_RECORDED, session, getAppointmentURL(session), notifyPP)
    )
  }

  fun sessionFeedbackRecordedEvent(session: ActionPlanSession, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.SESSION_FEEDBACK_RECORDED, session, getAppointmentURL(session), notifyPP)
    )
  }

  private fun getAppointmentURL(session: ActionPlanSession): String {
    val path = locationMapper.getPathFromControllerMethod(ActionPlanSessionController::getSession)
    return locationMapper.expandPathToCurrentRequestBaseUrl(path, session.actionPlan.id, session.sessionNumber).toString()
  }
}

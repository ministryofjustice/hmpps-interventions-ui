package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.AppointmentsController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment

enum class AppointmentEventType {
  ATTENDANCE_RECORDED,
  BEHAVIOUR_RECORDED,
  SESSION_FEEDBACK_RECORDED,
}

class AppointmentEvent(source: Any, val type: AppointmentEventType, val appointment: ActionPlanAppointment, val detailUrl: String, val notifyPP: Boolean) : ApplicationEvent(source) {
  override fun toString(): String {
    return "AppointmentEvent(type=$type, appointment=${appointment.id}, detailUrl='$detailUrl', source=$source)"
  }
}

@Component
class AppointmentEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {
  fun attendanceRecordedEvent(appointment: ActionPlanAppointment, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.ATTENDANCE_RECORDED, appointment, getAppointmentURL(appointment), notifyPP)
    )
  }

  fun behaviourRecordedEvent(appointment: ActionPlanAppointment, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.BEHAVIOUR_RECORDED, appointment, getAppointmentURL(appointment), notifyPP)
    )
  }

  fun sessionFeedbackRecordedEvent(appointment: ActionPlanAppointment, notifyPP: Boolean) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.SESSION_FEEDBACK_RECORDED, appointment, getAppointmentURL(appointment), notifyPP)
    )
  }

  private fun getAppointmentURL(appointment: ActionPlanAppointment): String {
    val path = locationMapper.getPathFromControllerMethod(AppointmentsController::getAppointment)
    return locationMapper.expandPathToCurrentRequestBaseUrl(path, appointment.actionPlan.id, appointment.sessionNumber).toString()
  }
}

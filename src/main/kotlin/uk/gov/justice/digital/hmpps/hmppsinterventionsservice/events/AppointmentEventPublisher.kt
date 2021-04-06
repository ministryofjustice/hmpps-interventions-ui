package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.AppointmentsController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment

enum class AppointmentEventType {
  ATTENDANCE_RECORDED,
}

class AppointmentEvent(source: Any, val type: AppointmentEventType, val appointment: ActionPlanAppointment, val detailUrl: String) : ApplicationEvent(source) {
  override fun toString(): String {
    return "AppointmentEvent(type=$type, appointment=${appointment.id}, detailUrl='$detailUrl', source=$source)"
  }
}

@Component
class AppointmentEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {
  fun attendanceRecordedEvent(appointment: ActionPlanAppointment) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.ATTENDANCE_RECORDED, appointment, getAppointmentAttendanceURL(appointment))
    )
  }

  private fun getAppointmentAttendanceURL(appointment: ActionPlanAppointment): String {
    val path = locationMapper.getPathFromControllerMethod(AppointmentsController::getAppointment)
    return locationMapper.expandPathToCurrentRequestBaseUrl(path, appointment.actionPlan.id, appointment.sessionNumber).toString()
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType

enum class AppointmentEventType {
  ATTENDANCE_RECORDED,
  BEHAVIOUR_RECORDED,
  SESSION_FEEDBACK_RECORDED,
}

class AppointmentEvent(source: Any, val type: AppointmentEventType, val appointment: Appointment, val detailUrl: String,
                       val notifyPP: Boolean, val appointmentType: AppointmentType) : ApplicationEvent(source) {
  override fun toString(): String {
    return "AppointmentEvent(type=$type, appointment=${appointment.id}, detailUrl='$detailUrl', source=$source)"
  }
}

@Component
class AppointmentEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {
  fun attendanceRecordedEvent(appointment: Appointment, notifyPP: Boolean, appointmentType: AppointmentType) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.ATTENDANCE_RECORDED, appointment, getAppointmentURL(appointment), notifyPP, appointmentType)
    )
  }

  fun behaviourRecordedEvent(appointment: Appointment, notifyPP: Boolean, appointmentType: AppointmentType) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.BEHAVIOUR_RECORDED, appointment, getAppointmentURL(appointment), notifyPP, appointmentType)
    )
  }

  fun sessionFeedbackRecordedEvent(appointment: Appointment, notifyPP: Boolean, appointmentType: AppointmentType) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(this, AppointmentEventType.SESSION_FEEDBACK_RECORDED, appointment, getAppointmentURL(appointment), notifyPP, appointmentType)
    )
  }

  private fun getAppointmentURL(appointment: Appointment, appointmentType: AppointmentType): String {
//    val path = locationMapper.getPathFromControllerMethod(AppointmentController::getSession)
//    return locationMapper.expandPathToCurrentRequestBaseUrl(path, session.actionPlan.id, session.sessionNumber).toString()
    return "aaaa"
  }
}

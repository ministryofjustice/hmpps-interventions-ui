package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ReferralController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.NotifyAppointmentService

enum class AppointmentEventType {
  ATTENDANCE_RECORDED,
  BEHAVIOUR_RECORDED,
  SESSION_FEEDBACK_RECORDED,
}

class AppointmentEvent(
  source: Any,
  val type: AppointmentEventType,
  val appointment: Appointment,
  val detailUrl: String,
  val notifyPP: Boolean,
  val appointmentType: AppointmentType
) : ApplicationEvent(source) {
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
      AppointmentEvent(
        this,
        AppointmentEventType.ATTENDANCE_RECORDED,
        appointment,
        getAppointmentURL(appointment, appointmentType),
        notifyPP,
        appointmentType
      )
    )
  }

  fun behaviourRecordedEvent(appointment: Appointment, notifyPP: Boolean, appointmentType: AppointmentType) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(
        this,
        AppointmentEventType.BEHAVIOUR_RECORDED,
        appointment,
        getAppointmentURL(appointment, appointmentType),
        notifyPP,
        appointmentType
      )
    )
  }

  fun sessionFeedbackRecordedEvent(appointment: Appointment, notifyPP: Boolean, appointmentType: AppointmentType) {
    applicationEventPublisher.publishEvent(
      AppointmentEvent(
        this,
        AppointmentEventType.SESSION_FEEDBACK_RECORDED,
        appointment,
        getAppointmentURL(appointment, appointmentType),
        notifyPP,
        appointmentType
      )
    )
  }

  private fun getAppointmentURL(appointment: Appointment, appointmentType: AppointmentType): String {
    when (appointmentType) {
      AppointmentType.SERVICE_DELIVERY -> run {
        NotifyAppointmentService.logger.error("action plan session should not be using the shared appointment notify service.")
        return ""
      }
      AppointmentType.SUPPLIER_ASSESSMENT -> run {
        val path = locationMapper.getPathFromControllerMethod(ReferralController::getSupplierAssessmentAppointment)
        return locationMapper.expandPathToCurrentRequestBaseUrl(path, appointment.referral.id).toString()
      }
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.DeliverySessionController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DeliverySessionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DeliverySession

enum class ActionPlanAppointmentEventType {
  ATTENDANCE_RECORDED,
  BEHAVIOUR_RECORDED,
  SESSION_FEEDBACK_RECORDED,
}

class ActionPlanAppointmentEvent(
  source: Any,
  val type: ActionPlanAppointmentEventType,
  val detailUrl: String,
  val referral: SentReferralDTO,
  val deliverySession: DeliverySessionDTO,
  val contractTypeName: String,
  val primeProviderName: String,
) : ApplicationEvent(source) {
  companion object {
    fun from(source: Any, type: ActionPlanAppointmentEventType, deliverySession: DeliverySession, detailUrl: String): ActionPlanAppointmentEvent {
      val referral = deliverySession.referral
      val contractTypeName = referral.intervention.dynamicFrameworkContract.contractType.name
      val primeProviderName = referral.intervention.dynamicFrameworkContract.primeProvider.name
      return ActionPlanAppointmentEvent(
        source, type, detailUrl,
        SentReferralDTO.from(referral, true),
        DeliverySessionDTO.from(deliverySession),
        contractTypeName, primeProviderName
      )
    }
  }

  override fun toString(): String {
    return "ActionPlanAppointmentEvent(type=$type, deliverySessionId=${deliverySession.id}, detailUrl='$detailUrl', source=$source)"
  }
}

@Component
class ActionPlanAppointmentEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {
  fun attendanceRecordedEvent(session: DeliverySession) {
    applicationEventPublisher.publishEvent(
      ActionPlanAppointmentEvent.from(this, ActionPlanAppointmentEventType.ATTENDANCE_RECORDED, session, getAppointmentURL(session))
    )
  }

  fun behaviourRecordedEvent(session: DeliverySession) {
    applicationEventPublisher.publishEvent(
      ActionPlanAppointmentEvent.from(this, ActionPlanAppointmentEventType.BEHAVIOUR_RECORDED, session, getAppointmentURL(session))
    )
  }

  fun sessionFeedbackRecordedEvent(session: DeliverySession) {
    applicationEventPublisher.publishEvent(
      ActionPlanAppointmentEvent.from(this, ActionPlanAppointmentEventType.SESSION_FEEDBACK_RECORDED, session, getAppointmentURL(session))
    )
  }

  private fun getAppointmentURL(session: DeliverySession): String {
    val path = locationMapper.getPathFromControllerMethod(DeliverySessionController::getSessionForReferralId)
    return locationMapper.expandPathToCurrentContextPathUrl(path, session.referral.id, session.sessionNumber).toString()
  }
}

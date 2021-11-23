package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import mu.KLogging
import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ReferralController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

enum class ReferralEventType {
  SENT, ASSIGNED, CANCELLED, PREMATURELY_ENDED, COMPLETED
}

class ReferralEvent(source: Any, val type: ReferralEventType, val referral: Referral, val detailUrl: String) : ApplicationEvent(source) {
  override fun toString(): String {
    return "ReferralEvent(type=$type, referral=${referral.id}, detailUrl='$detailUrl', source=$source)"
  }
}

@Component
class ReferralEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {
  companion object : KLogging()

  fun referralSentEvent(referral: Referral) {
    applicationEventPublisher.publishEvent(ReferralEvent(this, ReferralEventType.SENT, referral, getSentReferralURL(referral)))
  }

  fun referralAssignedEvent(referral: Referral) {
    applicationEventPublisher.publishEvent(ReferralEvent(this, ReferralEventType.ASSIGNED, referral, getSentReferralURL(referral)))
  }

  fun referralConcludedEvent(referral: Referral, eventType: ReferralEventType) {
    referral.currentAssignee ?: logger.warn("Concluding referral has no current assignment ${referral.id} for event type $eventType")
    applicationEventPublisher.publishEvent(ReferralEvent(this, eventType, referral, getSentReferralURL(referral)))
  }

  private fun getSentReferralURL(referral: Referral): String {
    val path = locationMapper.getPathFromControllerMethod(ReferralController::getSentReferral)
    return locationMapper.expandPathToCurrentContextPathUrl(path, referral.id).toString()
  }
}

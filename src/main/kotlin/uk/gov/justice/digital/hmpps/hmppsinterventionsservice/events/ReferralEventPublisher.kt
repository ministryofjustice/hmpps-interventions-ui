package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ReferralController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import kotlin.reflect.KFunction

enum class ReferralEventType {
  SENT, ASSIGNED,
}

class ReferralEvent(source: Any, val type: ReferralEventType, val referral: Referral, val detailUrl: String) : ApplicationEvent(source)

@Component
class ReferralEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {

  fun referralSentEvent(referral: Referral) {
    applicationEventPublisher.publishEvent(ReferralEvent(this, ReferralEventType.SENT, referral, getSentReferralURL(referral)))
  }

  fun referralAssignedEvent(referral: Referral) {
    applicationEventPublisher.publishEvent(ReferralEvent(this, ReferralEventType.ASSIGNED, referral, getSentReferralURL(referral)))
  }

  private fun getSentReferralURL(referral: Referral): String {
    // get the URL by introspecting the relevant controller method
    val method = ReferralController::getSentReferral as KFunction<*>
    val path = method.annotations.filterIsInstance<GetMapping>().first().value.first()

    return locationMapper.mapToCurrentContextPathAsString(path, referral.id)
  }
}

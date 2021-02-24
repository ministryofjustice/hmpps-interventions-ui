package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ReferralController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import kotlin.reflect.KFunction

enum class ReferralEventType {
  SENT, ASSIGNED,
}

class ReferralEvent(source: Any, val type: ReferralEventType, val referral: Referral, val detailUrl: String) : ApplicationEvent(source)

@Component
class ReferralEventPublisher(private val applicationEventPublisher: ApplicationEventPublisher) {
  fun referralSentEvent(referral: Referral) {
    applicationEventPublisher.publishEvent(ReferralEvent(this, ReferralEventType.SENT, referral, createDetailUrl(referral)))
  }

  fun referralAssignedEvent(referral: Referral) {
    applicationEventPublisher.publishEvent(ReferralEvent(this, ReferralEventType.ASSIGNED, referral, createDetailUrl(referral)))
  }

  private fun createDetailUrl(referral: Referral): String {
    val method = ReferralController::getSentReferral as KFunction<*>
    val path = method.annotations.filterIsInstance<GetMapping>().first().value.first()

    return ServletUriComponentsBuilder
      .fromCurrentContextPath()
      .path(path)
      .buildAndExpand(referral.id)
      .toUriString()
  }
}

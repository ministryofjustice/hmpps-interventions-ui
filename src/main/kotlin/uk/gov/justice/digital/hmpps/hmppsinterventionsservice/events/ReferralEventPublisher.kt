package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

enum class ReferralEventType {
  SENT, ASSIGNED,
}

class ReferralEvent(source: Any, val type: ReferralEventType, val referral: Referral) : ApplicationEvent(source)

@Component
class ReferralEventPublisher(private val applicationEventPublisher: ApplicationEventPublisher) {
  fun referralSentEvent(referral: Referral) {
    applicationEventPublisher.publishEvent(ReferralEvent(this, ReferralEventType.SENT, referral))
  }

  fun referralAssignedEvent(referral: Referral) {
    applicationEventPublisher.publishEvent(ReferralEvent(this, ReferralEventType.ASSIGNED, referral))
  }
}

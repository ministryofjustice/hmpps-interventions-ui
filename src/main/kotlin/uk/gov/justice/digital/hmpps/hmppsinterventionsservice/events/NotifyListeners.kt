// ktlint-disable filename
package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.NotifyService

@Component
class NotifyReferralEventListener(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.sent-referral}") private val interventionsUISentReferralLocation: String,
  private val notifyService: NotifyService,
) : ApplicationListener<ReferralEvent> {
  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        val location = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUISentReferralLocation)
          .buildAndExpand(event.referral.id)
          .toUri()

        // fixme: this email address will eventually come from the provider associated with the referral
        notifyService.referralSent(event.referral.referenceNumber!!, location, "tom.myers@digital.justice.gov.uk")
      }
    }
  }
}

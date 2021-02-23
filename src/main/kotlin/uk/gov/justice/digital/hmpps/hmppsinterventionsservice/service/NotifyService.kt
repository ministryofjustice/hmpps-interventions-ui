package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.service.notify.NotificationClient
import java.net.URI
import java.util.UUID

@Service
class NotifyService(
  @Value("\${notify.enabled}") private val enabled: Boolean,
  @Value("\${notify.templates.referral-sent}") private val referralSentTemplateID: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.sent-referral}") private val interventionsUISentReferralLocation: String,
  private val client: NotificationClient,
) : ApplicationListener<ReferralEvent> {
  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        val location = generateReferralUrl(interventionsUISentReferralLocation, event.referral.id)
        val serviceProvider = event.referral.intervention.dynamicFrameworkContract.serviceProvider
        sendEmail(
          referralSentTemplateID,
          serviceProvider.incomingReferralDistributionEmail,
          mapOf(
            "organisationName" to serviceProvider.name,
            "referenceNumber" to event.referral.referenceNumber!!,
            "referralUrl" to location.toString(),
          )
        )
      }
    }
  }

  private fun generateReferralUrl(path: String, id: UUID): URI {
    return UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
      .path(path)
      .buildAndExpand(id)
      .toUri()
  }

  private fun sendEmail(templateID: String, emailAddress: String, personalisation: Map<String, String>) {
    if (!enabled) {
      return
    }

    try {
      client.sendEmail(
        templateID,
        emailAddress,
        personalisation,
        null,
      )
    } catch (e: Exception) {
      // fixme: this failure is super important and we need a better way to reason about async errors of this nature
      log.error("email notification failed", e)
    }
  }

  companion object {
    private val log = LoggerFactory.getLogger(NotifyService::class.java)
  }
}

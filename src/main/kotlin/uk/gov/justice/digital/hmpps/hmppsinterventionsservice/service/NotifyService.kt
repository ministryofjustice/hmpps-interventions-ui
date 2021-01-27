package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import uk.gov.service.notify.NotificationClient
import java.net.URI

@Service
class NotifyService(
  @Value("\${notify.enabled}") private val enabled: Boolean,
  @Value("\${notify.templates.referral-sent}") private val referralSentTemplateID: String,
  private val client: NotificationClient,
) {
  fun referralSent(referenceNumber: String, location: URI, recipientEmail: String) {
    if (enabled) {
      try {
        client.sendEmail(
          referralSentTemplateID,
          recipientEmail,
          mapOf(
            "referenceNumber" to referenceNumber,
            "referralUrl" to location.toString(),
          ),
          null,
        )
      } catch (e: Exception) {
        // fixme: this failure is super important and we need a better way to reason about async errors of this nature
        log.error("referral sent notification failed", e)
      }
    }
  }

  companion object {
    private val log = LoggerFactory.getLogger(NotifyService::class.java)
  }
}

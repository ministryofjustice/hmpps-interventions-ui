package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import uk.gov.service.notify.NotificationClient
import uk.gov.service.notify.NotificationClientException
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
        val response = client.sendEmail(
          referralSentTemplateID,
          recipientEmail,
          mapOf(
            "referenceNumber" to referenceNumber,
            "referralUrl" to location.toString(),
          ),
          null,
        )
      } catch (e: Exception) {
        log.error("referral sent notification failed", e)
      }
    }
  }

  companion object {
    private val log = LoggerFactory.getLogger(NotifyService::class.java)
  }
}

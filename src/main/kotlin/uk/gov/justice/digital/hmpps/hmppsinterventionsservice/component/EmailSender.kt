package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import uk.gov.service.notify.NotificationClient

@Component
class EmailSender(
  @Value("\${notify.enabled}") private val enabled: Boolean,
  private val client: NotificationClient,
) {
  fun sendEmail(templateID: String, emailAddress: String, personalisation: Map<String, String>) {
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
    private val log = LoggerFactory.getLogger(EmailSender::class.java)
  }
}

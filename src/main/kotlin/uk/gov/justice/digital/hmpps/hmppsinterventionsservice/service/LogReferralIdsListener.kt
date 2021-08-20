package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KotlinLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType

@Service
class LogReferralIdsListener : ApplicationListener<ReferralEvent> {
  companion object {
    private val logger = KotlinLogging.logger {}
  }

  override fun onApplicationEvent(event: ReferralEvent) {
    if (event.type != ReferralEventType.SENT) {
      return
    }
    logger.info(
      "new referral sent, reference numbers:",
      StructuredArguments.kv("id", event.referral.id),
      StructuredArguments.kv("reference", event.referral.referenceNumber),
      StructuredArguments.kv("crn", event.referral.serviceUserCRN)
    )
  }
}

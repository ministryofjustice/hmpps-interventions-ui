package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.SNSPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType

@Service
class SNSService(
  private val snsPublisher: SNSPublisher,
  @Value("\${interventions-service.baseurl}") private val interventionsServiceBaseURL: String,
  @Value("\${interventions-service.locations.sent-referral}") private val interventionsServiceSentReferralLocation: String,
) : ApplicationListener<ReferralEvent> {

  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        val snsEvent = EventDTO(
          "intervention.referral.sent",
          "A referral has been sent to a Service Provider",
          createDetailUrl(event),
          event.referral.sentAt!!,
          1,
          mapOf("referralId" to event.referral.id)
        )
        snsPublisher.publish(snsEvent)
      }
//      ReferralEventType.ASSIGNED -> {
//        val snsEvent = EventDTO(
//          "intervention.referral.assigned",
//          "A referral has been assigned to a service user",
//          "http://localhost:5001" + "/sent-referral/${event.referral.id}",
//          event.referral.assignedAt!!,
//          1,
//          mapOf("referral_id" to event.referral.id, "assignedTo" to event.referral.assignedTo))
//        snsPublisher.publish(snsEvent)
//      }
    }
  }

  private fun createDetailUrl(event: ReferralEvent): String {
    return UriComponentsBuilder.fromHttpUrl(interventionsServiceBaseURL)
      .path(interventionsServiceSentReferralLocation)
      .buildAndExpand(event.referral.id)
      .toString()
  }
}

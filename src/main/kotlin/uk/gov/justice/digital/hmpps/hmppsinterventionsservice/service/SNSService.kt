package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.sns.SnsClient
import software.amazon.awssdk.services.sns.model.PublishRequest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType

@Service
class SNSService(
  private val client: SnsClient,
  private val objectMapper: ObjectMapper,
  @Value("\${aws.sns.enabled}") private val enabled: Boolean,
  @Value("\${aws.sns.topic.arn}") private val arn: String,
) : ApplicationListener<ReferralEvent> {

  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        // fixme: what data needs to go in here
        val message = mapOf(
          "eventType" to "intervention.referral.sent",
          "description" to "A referral has been sent to a Service Provider",
          "referral_id" to event.referral.id,
        )
        publish(objectMapper.writeValueAsString(message))
      }
      ReferralEventType.ASSIGNED -> {
        val message = mapOf(
          "eventType" to "intervention.referral.assigned",
          "description" to "A referral has been assigned to a service user",
//          "assigned_to" to event.referral.assignedTo,
//          "assigned_at" to event.referral.assignedAt,
          "referral_id" to event.referral.id,
        )
        publish(objectMapper.writeValueAsString(message))
      }
    }
  }

  private fun publish(message: String) {
    if (!enabled) {
      return
    }

    val request = PublishRequest.builder()
      .message(message)
      .topicArn(arn)
      .build()

    try {
      val result = client.publish(request)
      log.debug("message sent; messageId: ${result.messageId()}, status: ${result.sdkHttpResponse().statusCode()}")
    } catch (e: Exception) {
      log.error("message send failure", e)
    }
  }

  companion object {
    private val log = LoggerFactory.getLogger(SNSService::class.java)
  }
}

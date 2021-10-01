package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import com.fasterxml.jackson.databind.ObjectMapper
import com.microsoft.applicationinsights.TelemetryClient
import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sns.SnsClient
import software.amazon.awssdk.services.sns.model.MessageAttributeValue
import software.amazon.awssdk.services.sns.model.PublishRequest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import java.util.UUID

@Component
class SNSPublisher(
  private val client: SnsClient,
  private val objectMapper: ObjectMapper,
  private val telemetryClient: TelemetryClient,
  @Value("\${aws.sns.enabled}") private val enabled: Boolean,
  @Value("\${aws.sns.topic.arn}") private val arn: String,
) {
  companion object : KLogging()

  fun publish(referralId: UUID, actor: AuthUser, event: EventDTO) {
    if (enabled) {
      buildRequestAndPublish(event)
    } else {
      logger.debug("Event notification was not published due to sns being disabled.")
    }
    sendCustomEvent(referralId, actor, event.eventType)
  }

  private fun sendCustomEvent(referralId: UUID, actor: AuthUser, eventType: String) {
    telemetryClient.trackEvent(
      "InterventionsDomainEvent",
      mapOf(
        "event" to eventType,
        "referralId" to referralId.toString(),
        "actorUserId" to actor.id,
        "actorUserName" to actor.userName,
      ),
      null
    )
  }

  private fun buildRequestAndPublish(event: EventDTO) {
    val message = objectMapper.writeValueAsString(event)
    val messageAttributes = mapOf(
      "eventType" to MessageAttributeValue.builder()
        .dataType("String")
        .stringValue(event.eventType)
        .build()
    )
    val request = PublishRequest.builder()
      .messageAttributes(messageAttributes)
      .message(message)
      .topicArn(arn)
      .build()
    publishRequest(request)
  }

  private fun publishRequest(request: PublishRequest) {
    client.publish(request)
  }
}

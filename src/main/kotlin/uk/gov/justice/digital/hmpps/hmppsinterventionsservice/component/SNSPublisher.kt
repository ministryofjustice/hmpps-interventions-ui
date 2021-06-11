package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import com.fasterxml.jackson.databind.ObjectMapper
import com.microsoft.applicationinsights.TelemetryClient
import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sns.SnsClient
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
      telemetryClient.trackEvent(
        "InterventionsDomainEvent",
        mapOf(
          "event" to event.eventType,
          "referralId" to referralId.toString(),
          "actorUserId" to actor.id,
        ),
        null
      )
    } else {
      logger.debug("Event notification was not published due to sns being disabled.")
    }
  }

  private fun buildRequestAndPublish(event: EventDTO) {
    val message = objectMapper.writeValueAsString(event)
    val request = PublishRequest.builder()
      .message(message)
      .topicArn(arn)
      .build()
    publishRequest(request)
  }

  private fun publishRequest(request: PublishRequest) {
    client.publish(request)
  }
}

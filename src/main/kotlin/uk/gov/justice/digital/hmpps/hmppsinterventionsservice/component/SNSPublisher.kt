package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import com.fasterxml.jackson.databind.ObjectMapper
import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sns.SnsClient
import software.amazon.awssdk.services.sns.model.PublishRequest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO

@Component
class SNSPublisher(
  private val client: SnsClient,
  private val objectMapper: ObjectMapper,
  @Value("\${aws.sns.enabled}") private val enabled: Boolean,
  @Value("\${aws.sns.topic.arn}") private val arn: String,
) {
  companion object : KLogging()

  fun publish(event: EventDTO) {
    if (enabled) {
      buildRequestAndPublish(event)
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

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.sns.SnsClient
import software.amazon.awssdk.services.sns.model.PublishRequest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.SNSService

@Component
class SNSPublisher(
  private val client: SnsClient,
  private val objectMapper: ObjectMapper,
  @Value("\${aws.sns.enabled}") private val enabled: Boolean,
  @Value("\${aws.sns.topic.arn}") private val arn: String,
) {
  fun publish(event: EventDTO) {
    if (enabled) {
      return buildRequestAndPublish(event)
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

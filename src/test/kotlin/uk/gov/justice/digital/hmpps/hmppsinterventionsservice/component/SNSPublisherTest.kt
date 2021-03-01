package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import software.amazon.awssdk.services.sns.SnsClient
import software.amazon.awssdk.services.sns.model.PublishRequest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import java.time.OffsetDateTime

class SNSPublisherTest {
  private val snsClient = mock<SnsClient>()
  private val objectMapper = mock<ObjectMapper>()

  val event = EventDTO(
    "intervention.referral.sent",
    "A referral has been sent to a Service Provider",
    "http:test/abc",
    OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
    mapOf()
  )

  private fun snsPublisher(enabled: Boolean): SNSPublisher {
    return SNSPublisher(snsClient, objectMapper, enabled, "arn")
  }

  @Test
  fun `successful event published`() {
    whenever(objectMapper.writeValueAsString(event)).thenReturn("{}")
    snsPublisher(true).publish(event)

    val requestCaptor = argumentCaptor<PublishRequest>()
    verify(snsClient).publish(requestCaptor.capture())
    val response = (requestCaptor.firstValue.message())
    assertThat(response).isEqualTo("{}")
  }

  @Test
  fun `thrown exception is not swallowed`() {
    whenever(snsClient.publish(any<PublishRequest>())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> { snsPublisher(true).publish(event) }
  }

  @Test
  fun `event does not publish when service is disabled`() {
    snsPublisher(false).publish(event)
    verifyZeroInteractions(snsClient)
  }
}

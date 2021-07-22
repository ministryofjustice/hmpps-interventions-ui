package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import com.fasterxml.jackson.databind.ObjectMapper
import com.microsoft.applicationinsights.TelemetryClient
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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import java.time.OffsetDateTime
import java.util.UUID

class SNSPublisherTest {
  private val snsClient = mock<SnsClient>()
  private val objectMapper = mock<ObjectMapper>()
  private val telemetryClient = mock<TelemetryClient>()

  private val aReferralId = UUID.fromString("82138d14-3835-442b-b39b-9f8a07650bbe")
  private val aUser = AuthUser("d7c4c3a7a7", "irrelevant", "d7c4c3a7a7@example.org")

  val event = EventDTO(
    "intervention.test.event",
    "A referral has been sent to a Service Provider",
    "http:test/abc",
    OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
    mapOf()
  )

  private fun snsPublisher(enabled: Boolean): SNSPublisher {
    return SNSPublisher(snsClient, objectMapper, telemetryClient, enabled, "arn")
  }

  @Test
  fun `successful event published`() {
    whenever(objectMapper.writeValueAsString(event)).thenReturn("{}")
    snsPublisher(true).publish(aReferralId, aUser, event)

    val requestCaptor = argumentCaptor<PublishRequest>()
    verify(snsClient).publish(requestCaptor.capture())
    val response = (requestCaptor.firstValue.message())
    assertThat(response).isEqualTo("{}")
  }

  @Test
  fun `sends custom event to application insights on publish`() {
    snsPublisher(true).publish(aReferralId, aUser, event)
    verify(telemetryClient).trackEvent(
      "InterventionsDomainEvent",
      mapOf(
        "event" to "intervention.test.event",
        "referralId" to "82138d14-3835-442b-b39b-9f8a07650bbe",
        "actorUserId" to "d7c4c3a7a7",
        "actorUserName" to "d7c4c3a7a7@example.org",
      ),
      null
    )
  }

  @Test
  fun `thrown exception is not swallowed`() {
    whenever(snsClient.publish(any<PublishRequest>())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> { snsPublisher(true).publish(aReferralId, aUser, event) }
  }

  @Test
  fun `event does not publish when service is disabled`() {
    snsPublisher(false).publish(aReferralId, aUser, event)
    verifyZeroInteractions(snsClient)
  }

  @Test
  fun `event still sends telemetry when service is disabled`() {
    snsPublisher(false).publish(aReferralId, aUser, event)
    verify(telemetryClient).trackEvent(
      "InterventionsDomainEvent",
      mapOf(
        "event" to "intervention.test.event",
        "referralId" to "82138d14-3835-442b-b39b-9f8a07650bbe",
        "actorUserId" to "d7c4c3a7a7",
        "actorUserName" to "d7c4c3a7a7@example.org",
      ),
      null
    )
  }
}

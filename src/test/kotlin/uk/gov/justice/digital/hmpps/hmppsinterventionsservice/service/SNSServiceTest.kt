package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import software.amazon.awssdk.core.exception.SdkClientException
import software.amazon.awssdk.services.sns.SnsClient
import software.amazon.awssdk.services.sns.model.PublishRequest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.util.UUID

internal class SNSServiceTest {
  private val snsClient = mock<SnsClient>()

  private val referralSentEvent = ReferralEvent(
    "source",
    ReferralEventType.SENT,
    SampleData.sampleReferral(
      "X123456",
      "Harmony Living",
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
    ),
  )

  private fun snsService(enabled: Boolean): SNSService {
    return SNSService(snsClient, ObjectMapper(), enabled, "arn")
  }

  @Test
  fun `referral sent event publishes message with valid json`() {
    snsService(true).onApplicationEvent(referralSentEvent)

    val requestCaptor = argumentCaptor<PublishRequest>()
    verify(snsClient).publish(requestCaptor.capture())
    assertThat(requestCaptor.firstValue.message()).isEqualTo(
      """
      {"eventType":"intervention.referral.sent","description":"A referral has been sent to a Service Provider","referral_id":"68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"}
      """.trimIndent()
    )
  }

  @Test
  fun `referral sent event does not publish when service is disabled`() {
    snsService(false).onApplicationEvent(referralSentEvent)
    verifyZeroInteractions(snsClient)
  }

  @Test
  fun `test client errors are swallowed`() {
    whenever(snsClient.publish(any<PublishRequest>())).thenThrow(SdkClientException::class.java)
    assertDoesNotThrow { snsService(true).onApplicationEvent(referralSentEvent) }
  }
}

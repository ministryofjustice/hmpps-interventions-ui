
package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.isNull
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.service.notify.NotificationClient
import uk.gov.service.notify.NotificationClientException
import java.util.UUID

class NotifyServiceTest {
  private val notificationClient = mock<NotificationClient>()

  private val referralSentEvent = ReferralEvent(
    "source",
    ReferralEventType.SENT,
    SampleData.sampleReferral(
      "X123456",
      "Harmony Living",
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
    ),
    "http://localhost:8080/sent-referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
  )

  private fun notifyService(enabled: Boolean): NotifyService {
    return NotifyService(
      enabled,
      "templateID",
      "http://example.com",
      "/referral/{id}",
      notificationClient,
    )
  }

  @Test
  fun `referral sent event does not send email when service is disabled`() {
    notifyService(false).onApplicationEvent(referralSentEvent)
    verifyZeroInteractions(notificationClient)
  }

  @Test
  fun `referral sent event generates valid url and sends an email`() {
    notifyService(true).onApplicationEvent(referralSentEvent)
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(notificationClient).sendEmail(eq("templateID"), eq("tom.myers@digital.justice.gov.uk"), personalisationCaptor.capture(), isNull())
    assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("HAS71263")
    assertThat(personalisationCaptor.firstValue["referralUrl"]).isEqualTo("http://example.com/referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080")
  }

  @Test
  fun `client errors are swallowed`() {
    whenever(notificationClient.sendEmail(any(), any(), any(), anyOrNull())).thenThrow(NotificationClientException::class.java)
    assertDoesNotThrow { notifyService(true).onApplicationEvent(referralSentEvent) }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.NotifyService
import java.net.URI
import java.util.UUID

internal class NotifyReferralEventListenerTest {
  private val notifyService = mock<NotifyService>()
  private val listener = NotifyReferralEventListener(
    "http://example.com",
    "/referral/{id}",
    notifyService,
  )

  @Test
  fun `referral sent event generates valid url and calls notify service`() {
    val id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080")
    val referenceNumber = "HAS71263"
    val referral = Referral(id = id, referenceNumber = referenceNumber, serviceUserCRN = "X123456")
    val event = ReferralEvent("source", ReferralEventType.SENT, referral)
    listener.onApplicationEvent(event)

    val locationCaptor = argumentCaptor<URI>()
    verify(notifyService).referralSent(eq(referenceNumber), locationCaptor.capture(), any())

    assertThat(locationCaptor.firstValue.toString()).isEqualTo("http://example.com/referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080")
  }
}

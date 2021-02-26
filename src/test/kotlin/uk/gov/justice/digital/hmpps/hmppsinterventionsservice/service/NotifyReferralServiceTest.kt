
package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.util.UUID

class NotifyReferralServiceTest {
  private val emailSender = mock<EmailSender>()
  private val hmppsAuthService = mock<HMPPSAuthService>()
  private val referralFactory = ReferralFactory()
  private val authUserFactory = AuthUserFactory()

  private val referralSentEvent = ReferralEvent(
    "source",
    ReferralEventType.SENT,
    referralFactory.createSent(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "JS8762AC",
    ),
    "http://localhost:8080/sent-referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
  )

  private val referralAssignedEvent = ReferralEvent(
    "source",
    ReferralEventType.ASSIGNED,
    referralFactory.createSent(
      id = UUID.fromString("42C7D267-0776-4272-A8E8-A673BFE30D0D"),
      referenceNumber = "AJ9871AC",
      assignedTo = authUserFactory.create()
    ),
    "http://localhost:8080/sent-referral/42c7d267-0776-4272-a8e8-a673bfe30d0d",
  )

  private fun notifyService(): NotifyReferralService {
    return NotifyReferralService(
      "referralSentTemplateID",
      "referralAssignedTemplateID",
      "http://example.com",
      "/referral/{id}",
      emailSender,
      hmppsAuthService,
    )
  }

  @Test
  fun `referral sent event generates valid url and sends an email`() {
    notifyService().onApplicationEvent(referralSentEvent)
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("referralSentTemplateID"), eq("harmony@example.com"), personalisationCaptor.capture())
    assertThat(personalisationCaptor.firstValue["organisationName"]).isEqualTo("Harmony Living")
    assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("JS8762AC")
    assertThat(personalisationCaptor.firstValue["referralUrl"]).isEqualTo("http://example.com/referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080")
  }

  @Test
  fun `referral assigned event does not send email when user details are not available`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenThrow(RuntimeException::class.java)
    notifyService().onApplicationEvent(referralAssignedEvent)
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `referral assigned event swallows hmpps auth errors`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenThrow(UnverifiedEmailException::class.java)
    assertDoesNotThrow { notifyService().onApplicationEvent(referralAssignedEvent) }
  }

  @Test
  fun `referral assigned event generates valid url and sends an email`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("tom", "tom@tom.tom"))

    notifyService().onApplicationEvent(referralAssignedEvent)
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("referralAssignedTemplateID"), eq("tom@tom.tom"), personalisationCaptor.capture())
    assertThat(personalisationCaptor.firstValue["spFirstName"]).isEqualTo("tom")
    assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("AJ9871AC")
    assertThat(personalisationCaptor.firstValue["referralUrl"]).isEqualTo("http://example.com/referral/42c7d267-0776-4272-a8e8-a673bfe30d0d")
  }
}

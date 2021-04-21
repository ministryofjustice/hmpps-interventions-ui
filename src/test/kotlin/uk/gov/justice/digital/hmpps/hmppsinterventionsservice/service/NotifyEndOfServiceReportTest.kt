package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.EndOfServiceReportFactory
import java.util.UUID

class NotifyEndOfServiceReportTest {
  private val emailSender = mock<EmailSender>()
  private val hmppsAuthService = mock<HMPPSAuthService>()
  private val endOfServiceReportFactory = EndOfServiceReportFactory()
  private val authUserFactory = AuthUserFactory()

  private val endOfServiceReportSubmittedEvent = EndOfServiceReportEvent(
    "source",
    EndOfServiceReportEventType.SUBMITTED,
    endOfServiceReportFactory.create(
      id = UUID.fromString("42c7d267-0776-4272-a8e8-a673bfe30d0d"),
    ),
    "http://localhost:8080/end-of-service-report/42c7d267-0776-4272-a8e8-a673bfe30d0d",
    "ref1",
    authUserFactory.create("abc999", "auth", "abc999")
  )

  private fun notifyService(): NotifyEndOfServiceReportService {
    return NotifyEndOfServiceReportService(
      "template",
      "http://example.com",
      "/end-of-service-report/{id}",
      emailSender,
      hmppsAuthService,
    )
  }

  @Test
  fun `end of service report submitted event does not send email when user details are not available`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      notifyService().onApplicationEvent(endOfServiceReportSubmittedEvent)
    }
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `end of service report submitted event generates valid url and sends an email`() {
    whenever(hmppsAuthService.getUserDetail(AuthUser("abc999", "auth", "abc999")))
      .thenReturn(UserDetail("abc", "abc@abc.abc"))

    notifyService().onApplicationEvent(endOfServiceReportSubmittedEvent)
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("template"), eq("abc@abc.abc"), personalisationCaptor.capture())
    Assertions.assertThat(personalisationCaptor.firstValue["ppFirstName"]).isEqualTo("abc")
    Assertions.assertThat(personalisationCaptor.firstValue["referralReference"]).isEqualTo("ref1")
    Assertions.assertThat(personalisationCaptor.firstValue["endOfServiceReportLink"]).isEqualTo("http://example.com/end-of-service-report/42c7d267-0776-4272-a8e8-a673bfe30d0d")
  }
}

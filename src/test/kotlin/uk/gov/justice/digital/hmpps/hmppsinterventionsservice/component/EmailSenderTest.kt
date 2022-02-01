package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.isNull
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import uk.gov.service.notify.NotificationClient

class EmailSenderTest {

  private val notificationClient = mock<NotificationClient>()

  @Test
  fun `calls notification client to send email`() {
    val personalisation = mapOf<String, String>()
    EmailSender(true, notificationClient).sendEmail("template", "address", personalisation)
    verify(notificationClient).sendEmail("template", "address", personalisation, null)
  }

  @Test
  fun `Does not send email when not enabled`() {
    EmailSender(false, notificationClient).sendEmail("template", "address", mapOf())
    verifyNoInteractions(notificationClient)
  }

  @Test
  fun `Does not swallow exception thrown by notification client`() {
    whenever(notificationClient.sendEmail(any(), any(), any(), isNull())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      EmailSender(true, notificationClient).sendEmail("template", "address", mapOf())
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.isNotNull
import com.nhaarman.mockitokotlin2.isNull
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
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
    verifyZeroInteractions(notificationClient)
  }

  @Test
  fun `Does not swallow exception thrown by notification client`() {
    whenever(notificationClient.sendEmail(any(), any(), any(), isNull())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      EmailSender(true, notificationClient).sendEmail("template", "address", mapOf())
    }
  }
}

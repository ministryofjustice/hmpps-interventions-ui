
package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.isNull
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import uk.gov.service.notify.NotificationClient
import uk.gov.service.notify.NotificationClientException
import java.net.URI

@SpringBootTest(properties = ["spring.main.lazy-initialization=true"])
@ActiveProfiles("test", "local")
class NotifyServiceTest {
  @MockBean private lateinit var notificationClient: NotificationClient
  private val url = URI.create("http://interventions.com")

  @Test
  fun `test referralSent does nothing when notify is disabled in config`() {
    val notifyService = NotifyService(false, "templateID", notificationClient)
    notifyService.referralSent("", url, "")
    verifyZeroInteractions(notificationClient)
  }

  @Test
  fun `test referralSent sends an email`() {
    val notifyService = NotifyService(true, "templateID", notificationClient)
    notifyService.referralSent("", url, "tom@tom.tom")
    verify(notificationClient).sendEmail(eq("templateID"), eq("tom@tom.tom"), any(), isNull())
  }

  @Test
  fun `test referralSent doesnt blow up on notify errors`() {
    whenever(notificationClient.sendEmail(any(), any(), any(), anyOrNull())).thenThrow(NotificationClientException::class.java)
    val notifyService = NotifyService(true, "templateID", notificationClient)
    notifyService.referralSent("", url, "tom@tom.tom")
  }
}

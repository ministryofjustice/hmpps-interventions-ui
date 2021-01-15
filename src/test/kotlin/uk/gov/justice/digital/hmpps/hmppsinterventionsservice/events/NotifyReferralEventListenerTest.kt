package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import com.nhaarman.mockitokotlin2.capture
import com.nhaarman.mockitokotlin2.eq
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Captor
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service.NotifyService
import java.net.URI
import java.util.UUID

@SpringBootTest(properties = ["spring.main.lazy-initialization=true"])
@ActiveProfiles("test", "local")
internal class NotifyReferralEventListenerTest {
    @MockBean private lateinit var notifyService: NotifyService
    @Autowired private lateinit var listener: NotifyReferralEventListener
    @Captor private lateinit var URICaptor: ArgumentCaptor<URI>

    @Test
    fun `referral sent event generates valid url and calls notify service`() {
      val id = UUID.randomUUID()
      val referenceNumber = "HAS71263"
      val referral = Referral(id=id, referenceNumber = referenceNumber, serviceUserCRN = "X123456")
      val event = ReferralEvent("source", ReferralEventType.SENT, referral)
      listener.onApplicationEvent(event)

      val locationCaptor = ArgumentCaptor.forClass(URI::class.java)
      verify(notifyService).referralSent(eq(referenceNumber), capture(URICaptor), anyString())

      // we don't care about the actual URL, but we can assume that it requires the referral id
      assertThat(URICaptor.value.toString()).contains(id.toString())
    }
}

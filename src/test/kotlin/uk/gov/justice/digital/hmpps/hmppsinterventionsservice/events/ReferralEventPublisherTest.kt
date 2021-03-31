package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.context.ApplicationEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.net.URI

class ReferralEventPublisherTest {

  private val eventPublisher = mock<ApplicationEventPublisher>()
  private val locationMapper = mock<LocationMapper>()

  @Test
  fun `builds an referral sent event and publishes it`() {
    val referral = SampleData.sampleReferral("CRN1234", "Service Provider Name")
    val uri = URI.create("http://localhost/sent-referral/" + referral.id)
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl("/sent-referral/{id}", referral.id)).thenReturn(uri)
    val publisher = ReferralEventPublisher(eventPublisher, locationMapper)

    publisher.referralSentEvent(referral)

    val eventCaptor = argumentCaptor<ReferralEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    assertThat(event.source).isSameAs(publisher)
    assertThat(event.type).isSameAs(ReferralEventType.SENT)
    assertThat(event.referral).isSameAs(referral)
    assertThat(event.detailUrl).isEqualTo(uri.toString())
  }

  @Test
  fun `builds an referral assign event and publishes it`() {
    val referral = SampleData.sampleReferral("CRN1234", "Service Provider Name")
    val uri = URI.create("http://localhost/sent-referral/" + referral.id)
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl("/sent-referral/{id}", referral.id)).thenReturn(uri)
    val publisher = ReferralEventPublisher(eventPublisher, locationMapper)

    publisher.referralAssignedEvent(referral)

    val eventCaptor = argumentCaptor<ReferralEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    assertThat(event.source).isSameAs(publisher)
    assertThat(event.type).isSameAs(ReferralEventType.ASSIGNED)
    assertThat(event.referral).isSameAs(referral)
    assertThat(event.detailUrl).isEqualTo(uri.toString())
  }
}

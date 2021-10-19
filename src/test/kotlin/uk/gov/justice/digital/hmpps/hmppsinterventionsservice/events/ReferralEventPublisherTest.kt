package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.context.ApplicationEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ReferralController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType.ASSIGNED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType.COMPLETED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType.SENT
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.net.URI

class ReferralEventPublisherTest {

  private val eventPublisher = mock<ApplicationEventPublisher>()
  private val locationMapper = mock<LocationMapper>()

  @Test
  fun `builds an referral sent event and publishes it`() {
    val referral = SampleData.sampleReferral("CRN1234", "Service Provider Name")
    val uri = URI.create("http://localhost/sent-referral/" + referral.id)
    whenever(locationMapper.expandPathToCurrentContextPathUrl("/sent-referral/{id}", referral.id)).thenReturn(uri)
    whenever(locationMapper.getPathFromControllerMethod(ReferralController::getSentReferral)).thenReturn("/sent-referral/{id}")
    val publisher = ReferralEventPublisher(eventPublisher, locationMapper)

    publisher.referralSentEvent(referral)

    val eventCaptor = argumentCaptor<ReferralEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    assertThat(event.source).isSameAs(publisher)
    assertThat(event.type).isSameAs(SENT)
    assertThat(event.referral).isSameAs(referral)
    assertThat(event.detailUrl).isEqualTo(uri.toString())
  }

  @Test
  fun `builds an referral assign event and publishes it`() {
    val referral = SampleData.sampleReferral("CRN1234", "Service Provider Name")
    val uri = URI.create("http://localhost/sent-referral/" + referral.id)
    whenever(locationMapper.expandPathToCurrentContextPathUrl("/sent-referral/{id}", referral.id)).thenReturn(uri)
    whenever(locationMapper.getPathFromControllerMethod(ReferralController::getSentReferral)).thenReturn("/sent-referral/{id}")
    val publisher = ReferralEventPublisher(eventPublisher, locationMapper)

    publisher.referralAssignedEvent(referral)

    val eventCaptor = argumentCaptor<ReferralEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    assertThat(event.source).isSameAs(publisher)
    assertThat(event.type).isSameAs(ASSIGNED)
    assertThat(event.referral).isSameAs(referral)
    assertThat(event.detailUrl).isEqualTo(uri.toString())
  }

  @Test
  fun `builds an referral conclude event and publishes it`() {
    val referral = SampleData.sampleReferral("CRN1234", "Service Provider Name")
    val uri = URI.create("http://localhost/sent-referral/" + referral.id)
    whenever(locationMapper.expandPathToCurrentContextPathUrl("/sent-referral/{id}", referral.id)).thenReturn(uri)
    whenever(locationMapper.getPathFromControllerMethod(ReferralController::getSentReferral)).thenReturn("/sent-referral/{id}")
    val publisher = ReferralEventPublisher(eventPublisher, locationMapper)

    publisher.referralConcludedEvent(referral, COMPLETED)

    val eventCaptor = argumentCaptor<ReferralEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    assertThat(event.source).isSameAs(publisher)
    assertThat(event.type).isSameAs(COMPLETED)
    assertThat(event.referral).isSameAs(referral)
    assertThat(event.detailUrl).isEqualTo(uri.toString())
  }
}

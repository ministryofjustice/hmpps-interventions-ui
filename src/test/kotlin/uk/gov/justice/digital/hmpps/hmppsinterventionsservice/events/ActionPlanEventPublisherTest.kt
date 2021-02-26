package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.context.ApplicationEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType.SUBMITTED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData

class ActionPlanEventPublisherTest {

  private val eventPublisher = mock<ApplicationEventPublisher>()
  private val locationMapper = mock<LocationMapper>()

  @Test
  fun `builds an action plan submit event and publishes it`() {
    val actionPlan = SampleData.sampleActionPlan()
    val detailUrl = "//localhost/actionPlan/" + actionPlan.id
    whenever(locationMapper.mapToCurrentRequestBasePathAsString("/action-plan/{id}", actionPlan.id)).thenReturn(detailUrl)
    val publisher = ActionPlanEventPublisher(eventPublisher, locationMapper)

    publisher.actionPlanSubmitEvent(actionPlan)

    val eventCaptor = argumentCaptor<ActionPlanEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    assertThat(event.source).isSameAs(publisher)
    assertThat(event.type).isSameAs(SUBMITTED)
    assertThat(event.actionPlan).isSameAs(actionPlan)
    assertThat(event.detailUrl).isSameAs(detailUrl)
  }
}

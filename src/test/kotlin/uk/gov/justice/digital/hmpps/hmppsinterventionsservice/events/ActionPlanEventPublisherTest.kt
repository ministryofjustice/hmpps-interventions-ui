package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.context.ApplicationEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.ActionPlanController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType.SUBMITTED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.net.URI

class ActionPlanEventPublisherTest {

  private val eventPublisher = mock<ApplicationEventPublisher>()
  private val locationMapper = mock<LocationMapper>()

  @Test
  fun `builds an action plan submit event and publishes it`() {
    val actionPlan = SampleData.sampleActionPlan()
    val uri = URI.create("http://localhost/action-plan/${actionPlan.id}")
    whenever(locationMapper.expandPathToCurrentContextPathUrl("/action-plan/{id}", actionPlan.id)).thenReturn(uri)
    whenever(locationMapper.getPathFromControllerMethod(ActionPlanController::getActionPlan)).thenReturn("/action-plan/{id}")
    val publisher = ActionPlanEventPublisher(eventPublisher, locationMapper)

    publisher.actionPlanSubmitEvent(actionPlan)

    val eventCaptor = argumentCaptor<ActionPlanEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    assertThat(event.source).isSameAs(publisher)
    assertThat(event.type).isSameAs(SUBMITTED)
    assertThat(event.actionPlan).isSameAs(actionPlan)
    assertThat(event.detailUrl).isEqualTo(uri.toString())
  }
}

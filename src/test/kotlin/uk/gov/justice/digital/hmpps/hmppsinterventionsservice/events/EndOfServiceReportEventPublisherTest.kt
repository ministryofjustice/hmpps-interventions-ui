package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.context.ApplicationEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.EndOfServiceReportController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.EndOfServiceReportFactory
import java.net.URI

class EndOfServiceReportEventPublisherTest {

  private val eventPublisher = mock<ApplicationEventPublisher>()
  private val locationMapper = mock<LocationMapper>()
  private val endOfServiceReportFactory = EndOfServiceReportFactory()
  private val authUserFactory = AuthUserFactory()

  @Test
  fun `builds an end of service report submit event and publishes it`() {
    val endOfServiceReport = endOfServiceReportFactory.create()
    val ppUser = authUserFactory.create()

    val uri = URI.create("http://localhost/end-of-service-report/${endOfServiceReport.id}")
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl("/end-of-service-report/{id}", endOfServiceReport.id))
      .thenReturn(uri)
    whenever(locationMapper.getPathFromControllerMethod(EndOfServiceReportController::getEndOfServiceReportById))
      .thenReturn("/end-of-service-report/{id}")
    val publisher = EndOfServiceReportEventPublisher(eventPublisher, locationMapper)

    publisher.endOfServiceReportSubmittedEvent(endOfServiceReport, "ref1", ppUser)

    val eventCaptor = argumentCaptor<EndOfServiceReportEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    Assertions.assertThat(event.source).isSameAs(publisher)
    Assertions.assertThat(event.type).isSameAs(EndOfServiceReportEventType.SUBMITTED)
    Assertions.assertThat(event.endOfServiceReport).isSameAs(endOfServiceReport)
    Assertions.assertThat(event.detailUrl).isEqualTo(uri.toString())
  }
}

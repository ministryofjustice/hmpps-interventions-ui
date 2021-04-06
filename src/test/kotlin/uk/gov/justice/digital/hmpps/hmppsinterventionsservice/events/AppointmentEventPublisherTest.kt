package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.context.ApplicationEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.AppointmentsController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.net.URI

class AppointmentEventPublisherTest {
  private val eventPublisher = mock<ApplicationEventPublisher>()
  private val locationMapper = mock<LocationMapper>()

  @Test
  fun `builds an appointment attendance recorded event and publishes it`() {
    val appointment = SampleData.sampleActionPlanAppointment(
      actionPlan = SampleData.sampleActionPlan(),
      createdBy = SampleData.sampleAuthUser()
    )
    val uri = URI.create("http://localhost//action-plan/${appointment.id}/appointments/${appointment.sessionNumber}")
    whenever(
      locationMapper.expandPathToCurrentRequestBaseUrl(
        "/action-plan/{id}/appointments/{sessionNumber}",
        appointment.actionPlan.id, appointment.sessionNumber
      )
    ).thenReturn(uri)
    whenever(locationMapper.getPathFromControllerMethod(AppointmentsController::getAppointment)).thenReturn("/action-plan/{id}/appointments/{sessionNumber}")
    val publisher = AppointmentEventPublisher(eventPublisher, locationMapper)

    publisher.attendanceRecordedEvent(appointment)

    val eventCaptor = argumentCaptor<AppointmentEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    Assertions.assertThat(event.source).isSameAs(publisher)
    Assertions.assertThat(event.type).isSameAs(AppointmentEventType.ATTENDANCE_RECORDED)
    Assertions.assertThat(event.appointment).isSameAs(appointment)
    Assertions.assertThat(event.detailUrl).isEqualTo(uri.toString())
  }
}

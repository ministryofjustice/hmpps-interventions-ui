package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.context.ApplicationEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import java.net.URI

class AppointmentEventPublisherTest {
  private val eventPublisher = mock<ApplicationEventPublisher>()
  private val locationMapper = mock<LocationMapper>()
  private val appointmentFactory = AppointmentFactory()
  private val publisher = AppointmentEventPublisher(eventPublisher, locationMapper)

  @BeforeEach
  fun setup() {
    whenever(locationMapper.getPathFromControllerMethod(any())).thenReturn("")
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl(any(), any()))
      .thenReturn(URI.create("http://localhost/sent-referral/123/supplier-assessment"))
  }

  @Test
  fun `builds an appointment attendance recorded event and publishes it`() {
    val appointment = appointmentFactory.create()

    publisher.attendanceRecordedEvent(appointment, false, AppointmentType.SUPPLIER_ASSESSMENT)

    val eventCaptor = argumentCaptor<AppointmentEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    Assertions.assertThat(event.source).isSameAs(publisher)
    Assertions.assertThat(event.type).isSameAs(AppointmentEventType.ATTENDANCE_RECORDED)
    Assertions.assertThat(event.appointment).isSameAs(appointment)
    Assertions.assertThat(event.detailUrl).isEqualTo("http://localhost/sent-referral/123/supplier-assessment")
    Assertions.assertThat(event.notifyPP).isFalse
  }

  @Test
  fun `builds an appointment behaviour recorded event and publishes it`() {
    val appointment = appointmentFactory.create()

    publisher.behaviourRecordedEvent(appointment, true, AppointmentType.SUPPLIER_ASSESSMENT)

    val eventCaptor = argumentCaptor<AppointmentEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    Assertions.assertThat(event.source).isSameAs(publisher)
    Assertions.assertThat(event.type).isSameAs(AppointmentEventType.BEHAVIOUR_RECORDED)
    Assertions.assertThat(event.appointment).isSameAs(appointment)
    Assertions.assertThat(event.detailUrl).isEqualTo("http://localhost/sent-referral/123/supplier-assessment")
    Assertions.assertThat(event.notifyPP).isTrue
  }

  @Test
  fun `builds an appointment session feedback event and publishes it`() {
    val appointment = appointmentFactory.create()

    publisher.sessionFeedbackRecordedEvent(appointment, true, AppointmentType.SUPPLIER_ASSESSMENT)

    val eventCaptor = argumentCaptor<AppointmentEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    Assertions.assertThat(event.source).isSameAs(publisher)
    Assertions.assertThat(event.type).isSameAs(AppointmentEventType.SESSION_FEEDBACK_RECORDED)
    Assertions.assertThat(event.appointment).isSameAs(appointment)
    Assertions.assertThat(event.detailUrl).isEqualTo("http://localhost/sent-referral/123/supplier-assessment")
    Assertions.assertThat(event.notifyPP).isTrue
  }
}

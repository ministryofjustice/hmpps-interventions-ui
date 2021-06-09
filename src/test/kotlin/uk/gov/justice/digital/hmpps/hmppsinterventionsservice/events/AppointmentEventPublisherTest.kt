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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.LATE
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanSessionFactory
import java.net.URI
import java.time.OffsetDateTime

class AppointmentEventPublisherTest {
  private val eventPublisher = mock<ApplicationEventPublisher>()
  private val locationMapper = mock<LocationMapper>()
  private val publisher = AppointmentEventPublisher(eventPublisher, locationMapper)

  @BeforeEach
  fun setup() {
    whenever(locationMapper.getPathFromControllerMethod(any())).thenReturn("")
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl(any(), any(), any()))
      .thenReturn(URI.create("http://localhost/action-plan/123/appointments/1"))
  }

  @Test
  fun `builds an appointment attendance recorded event and publishes it`() {
    val session = ActionPlanSessionFactory().create()

    publisher.attendanceRecordedEvent(session, false)

    val eventCaptor = argumentCaptor<AppointmentEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    Assertions.assertThat(event.source).isSameAs(publisher)
    Assertions.assertThat(event.type).isSameAs(AppointmentEventType.ATTENDANCE_RECORDED)
    Assertions.assertThat(event.actionPlanSession).isSameAs(session)
    Assertions.assertThat(event.detailUrl).isEqualTo("http://localhost/action-plan/123/appointments/1")
    Assertions.assertThat(event.notifyPP).isFalse
  }

  @Test
  fun `builds an appointment behaviour recorded event and publishes it`() {
    val appointment = ActionPlanSessionFactory().create()

    publisher.behaviourRecordedEvent(appointment, true)

    val eventCaptor = argumentCaptor<AppointmentEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    Assertions.assertThat(event.source).isSameAs(publisher)
    Assertions.assertThat(event.type).isSameAs(AppointmentEventType.BEHAVIOUR_RECORDED)
    Assertions.assertThat(event.actionPlanSession).isSameAs(appointment)
    Assertions.assertThat(event.detailUrl).isEqualTo("http://localhost/action-plan/123/appointments/1")
    Assertions.assertThat(event.notifyPP).isTrue
  }

  @Test
  fun `builds an appointment session feedback event and publishes it`() {
    val appointment = ActionPlanSessionFactory().create(
      attended = LATE,
      additionalAttendanceInformation = "Behaviour was fine",
      attendanceSubmittedAt = OffsetDateTime.now()
    )

    publisher.sessionFeedbackRecordedEvent(appointment, true)

    val eventCaptor = argumentCaptor<AppointmentEvent>()
    verify(eventPublisher).publishEvent(eventCaptor.capture())
    val event = eventCaptor.firstValue

    Assertions.assertThat(event.source).isSameAs(publisher)
    Assertions.assertThat(event.type).isSameAs(AppointmentEventType.SESSION_FEEDBACK_RECORDED)
    Assertions.assertThat(event.actionPlanSession).isSameAs(appointment)
    Assertions.assertThat(event.detailUrl).isEqualTo("http://localhost/action-plan/123/appointments/1")
    Assertions.assertThat(event.notifyPP).isTrue
  }
}

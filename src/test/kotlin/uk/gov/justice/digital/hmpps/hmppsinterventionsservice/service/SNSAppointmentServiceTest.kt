package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.SNSPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID

internal class SNSAppointmentServiceTest {
  private val publisher = mock<SNSPublisher>()
  private val snsAppointmentService = SNSAppointmentService(publisher)

  private val appointmentFactory = AppointmentFactory()
  private val authUserFactory = AuthUserFactory()
  private val referral = ReferralFactory().createSent(id = UUID.fromString("56b40f96-0657-4e01-925c-da208a6fbcfd"))
  private val now = OffsetDateTime.now()
  private val user = authUserFactory.create()

  private fun attendanceRecordedEvent(attendance: Attended) = AppointmentEvent(
    "source",
    AppointmentEventType.ATTENDANCE_RECORDED,
    appointmentFactory.create(
      referral = referral,
      attended = attendance,
      attendanceSubmittedAt = now,
      appointmentFeedbackSubmittedBy = user,
    ),
    "http://localhost/sent-referral/123/supplier-assessment",
    false,
    appointmentType = AppointmentType.SUPPLIER_ASSESSMENT
  )

  private fun feedbackSubmittedEvent(attendance: Attended) = AppointmentEvent(
    "source",
    AppointmentEventType.SESSION_FEEDBACK_RECORDED,
    appointmentFactory.create(
      referral = referral,
      attended = attendance,
      attendanceSubmittedAt = now.minusSeconds(1),
      appointmentFeedbackSubmittedBy = user,
      appointmentFeedbackSubmittedAt = now,
      deliusAppointmentId = 123L,
    ),
    "http://localhost/sent-referral/123/supplier-assessment",
    false,
    appointmentType = AppointmentType.SUPPLIER_ASSESSMENT
  )

  @Test
  fun `appointment attendance recorded event publishes message with valid DTO`() {
    snsAppointmentService.onApplicationEvent(attendanceRecordedEvent(Attended.NO))

    val referralId = UUID.fromString("56b40f96-0657-4e01-925c-da208a6fbcfd")
    val eventDTO = EventDTO(
      eventType = "intervention.initial-assessment-appointment.missed",
      description = "Attendance was recorded for an initial assessment appointment",
      detailUrl = "http://localhost/sent-referral/123/supplier-assessment",
      occurredAt = now,
      additionalInformation = mapOf(
        "serviceUserCRN" to "X123456",
        "referralId" to referralId
      ),
    )

    verify(publisher).publish(referralId, user, eventDTO)
  }

  @Test
  fun `appointment feedback submitted event publishes message with valid DTO`() {
    snsAppointmentService.onApplicationEvent(feedbackSubmittedEvent(Attended.YES))

    val referralId = UUID.fromString("56b40f96-0657-4e01-925c-da208a6fbcfd")
    val eventDTO = EventDTO(
      eventType = "intervention.initial-assessment-appointment.session-feedback-submitted",
      description = "Session feedback submitted for an initial assessment appointment",
      detailUrl = "http://localhost/sent-referral/123/supplier-assessment",
      occurredAt = now,
      additionalInformation = mapOf(
        "serviceUserCRN" to "X123456",
        "referralId" to referralId,
        "deliusAppointmentId" to "123"
      ),
    )

    verify(publisher).publish(referralId, user, eventDTO)
  }

  @Test
  fun `appointment attendance recorded event type reflects attendance status`() {
    snsAppointmentService.onApplicationEvent(attendanceRecordedEvent(Attended.YES))
    snsAppointmentService.onApplicationEvent(attendanceRecordedEvent(Attended.LATE))

    val eventCaptor = argumentCaptor<EventDTO>()
    verify(publisher, times(2)).publish(eq(referral.id), eq(user), eventCaptor.capture())
    eventCaptor.allValues.forEach {
      assertThat(it.eventType).isEqualTo("intervention.initial-assessment-appointment.attended")
    }
  }
}

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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanSessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID

internal class SNSAppointmentServiceTest {
  private val publisher = mock<SNSPublisher>()
  private val snsAppointmentService = SNSAppointmentService(publisher)

  private val actionPlanSessionFactory = ActionPlanSessionFactory()
  private val actionPlan = ActionPlanFactory().create(
    referral = ReferralFactory().createSent(id = UUID.fromString("56b40f96-0657-4e01-925c-da208a6fbcfd"))
  )
  private val now = OffsetDateTime.now()
  private fun attendanceRecordedEvent(attendance: Attended) = ActionPlanAppointmentEvent(
    "source",
    ActionPlanAppointmentEventType.ATTENDANCE_RECORDED,
    actionPlanSessionFactory.createAttended(
      actionPlan = actionPlan,
      createdBy = actionPlan.createdBy,
      attended = attendance,
      attendanceSubmittedAt = now,
      appointmentFeedbackSubmittedBy = actionPlan.createdBy,
    ),
    "http://localhost:8080/action-plan/77df9f6c-3fcb-4ec6-8fcf-96551cd9b080/session/1",
    false,
  )

  @Test
  fun `appointment attendance recorded event publishes message with valid DTO`() {
    snsAppointmentService.onApplicationEvent(attendanceRecordedEvent(Attended.NO))

    val referralId = UUID.fromString("56b40f96-0657-4e01-925c-da208a6fbcfd")
    val eventDTO = EventDTO(
      eventType = "intervention.session-appointment.missed",
      description = "Attendance was recorded for a session appointment",
      detailUrl = "http://localhost:8080/action-plan/77df9f6c-3fcb-4ec6-8fcf-96551cd9b080/session/1",
      occurredAt = now,
      additionalInformation = mapOf(
        "serviceUserCRN" to "X123456",
        "referralId" to referralId
      ),
    )

    verify(publisher).publish(referralId, actionPlan.createdBy, eventDTO)
  }

  @Test
  fun `appointment attendance recorded event type reflects attendance status`() {
    snsAppointmentService.onApplicationEvent(attendanceRecordedEvent(Attended.YES))
    snsAppointmentService.onApplicationEvent(attendanceRecordedEvent(Attended.LATE))

    val eventCaptor = argumentCaptor<EventDTO>()
    verify(publisher, times(2)).publish(eq(actionPlan.referral.id), eq(actionPlan.createdBy), eventCaptor.capture())
    eventCaptor.allValues.forEach {
      assertThat(it.eventType).isEqualTo("intervention.session-appointment.attended")
    }
  }
}

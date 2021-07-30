package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanSessionFactory
import java.time.OffsetDateTime
import java.util.UUID

class NotifyActionPlanAppointmentServiceTest {
  private val emailSender = mock<EmailSender>()
  private val referralService = mock<ReferralService>()
  private val actionPlanSessionFactory = ActionPlanSessionFactory()

  private fun appointmentEvent(type: ActionPlanAppointmentEventType, notifyPP: Boolean): ActionPlanAppointmentEvent {
    return ActionPlanAppointmentEvent(
      "source",
      type,
      actionPlanSessionFactory.createAttended(
        id = UUID.fromString("42c7d267-0776-4272-a8e8-a673bfe30d0d"),
        actionPlan = SampleData.sampleActionPlan(
          id = UUID.fromString("4907ffb5-94cf-4eff-8cf9-dcf09765be42"),
          referral = SampleData.sampleReferral(
            "X123456",
            "Harmony Living",
            id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
            referenceNumber = "HAS71263",
            sentAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
          ),
        ),
        createdBy = SampleData.sampleAuthUser(),
        attended = Attended.YES,
      ),
      "http://localhost:8080/appointment/42c7d267-0776-4272-a8e8-a673bfe30d0d",
      notifyPP,
    )
  }

  private fun notifyService(): NotifyActionPlanAppointmentService {
    return NotifyActionPlanAppointmentService(
      "template",
      "template",
      "http://example.com",
      "/pp/action-plan/{id}/appointment/sessionNumber/{sessionNumber}/feedback",
      emailSender,
      referralService,
    )
  }

  @Test
  fun `appointment attendance recorded event does not send email when user details are not available`() {
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      notifyService().onApplicationEvent(appointmentEvent(ActionPlanAppointmentEventType.ATTENDANCE_RECORDED, true))
    }
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment attendance recorded event does not send email when notifyPP is false`() {
    notifyService().onApplicationEvent(appointmentEvent(ActionPlanAppointmentEventType.ATTENDANCE_RECORDED, false))
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment attendance recorded event calls email client`() {
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenReturn(ContactableProbationPractitioner("abc", "abc@abc.com"))

    notifyService().onApplicationEvent(appointmentEvent(ActionPlanAppointmentEventType.ATTENDANCE_RECORDED, true))
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("template"), eq("abc@abc.com"), personalisationCaptor.capture())
    Assertions.assertThat(personalisationCaptor.firstValue["ppFirstName"]).isEqualTo("abc")
    Assertions.assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("HAS71263")
    Assertions.assertThat(personalisationCaptor.firstValue["attendanceUrl"]).isEqualTo("http://example.com/pp/action-plan/4907ffb5-94cf-4eff-8cf9-dcf09765be42/appointment/sessionNumber/1/feedback")
  }

  @Test
  fun `appointment behaviour recorded event does not send email when user details are not available`() {
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      notifyService().onApplicationEvent(appointmentEvent(ActionPlanAppointmentEventType.BEHAVIOUR_RECORDED, true))
    }
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment behaviour recorded event does not send email when notifyPP is false`() {
    notifyService().onApplicationEvent(appointmentEvent(ActionPlanAppointmentEventType.BEHAVIOUR_RECORDED, false))
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment behaviour recorded event calls email client`() {
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenReturn(ContactableProbationPractitioner("abc", "abc@abc.com"))

    notifyService().onApplicationEvent(appointmentEvent(ActionPlanAppointmentEventType.BEHAVIOUR_RECORDED, true))
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("template"), eq("abc@abc.com"), personalisationCaptor.capture())
    Assertions.assertThat(personalisationCaptor.firstValue["ppFirstName"]).isEqualTo("abc")
    Assertions.assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("HAS71263")
    Assertions.assertThat(personalisationCaptor.firstValue["sessionUrl"]).isEqualTo("http://example.com/pp/action-plan/4907ffb5-94cf-4eff-8cf9-dcf09765be42/appointment/sessionNumber/1/feedback")
  }
}

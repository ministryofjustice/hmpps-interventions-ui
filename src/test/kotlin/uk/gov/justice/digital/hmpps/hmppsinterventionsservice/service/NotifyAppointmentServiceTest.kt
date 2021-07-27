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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.util.UUID

class NotifyAppointmentServiceTest {
  private val emailSender = mock<EmailSender>()
  private val hmppsAuthService = mock<HMPPSAuthService>()
  private val appointmentFactory = AppointmentFactory()
  private val referralFactory = ReferralFactory()

  private fun appointmentEvent(type: AppointmentEventType, notifyPP: Boolean, appointmentType: AppointmentType = AppointmentType.SUPPLIER_ASSESSMENT): AppointmentEvent {
    return AppointmentEvent(
      "source",
      type,
      appointmentFactory.create(referral = referralFactory.createSent(id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"))),
      "http://localhost:8080/appointment/42c7d267-0776-4272-a8e8-a673bfe30d0d",
      notifyPP,
      appointmentType
    )
  }

  private fun notifyService(): NotifyAppointmentService {
    return NotifyAppointmentService(
      "template",
      "template",
      "template",
      "http://example.com",
      "/probation-practitioner/referrals/{id}/progress",
      "/probation-practitioner/referrals/{id}/supplier-assessment/post-session-feedback",
      emailSender,
      hmppsAuthService,
    )
  }

  @Test
  fun `appointment attendance recorded event does not send email when user details are not available`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      notifyService().onApplicationEvent(appointmentEvent(AppointmentEventType.ATTENDANCE_RECORDED, true))
    }
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment attendance recorded event does not send email when notifyPP is false`() {
    notifyService().onApplicationEvent(appointmentEvent(AppointmentEventType.ATTENDANCE_RECORDED, false))
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment attendance recorded event calls email client`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("abc", "abc@abc.com"))

    notifyService().onApplicationEvent(appointmentEvent(AppointmentEventType.ATTENDANCE_RECORDED, true))
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("template"), eq("abc@abc.com"), personalisationCaptor.capture())
    Assertions.assertThat(personalisationCaptor.firstValue["ppFirstName"]).isEqualTo("abc")
    Assertions.assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("JS18726AC")
    Assertions.assertThat(personalisationCaptor.firstValue["attendanceUrl"]).isEqualTo("http://example.com/probation-practitioner/referrals/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080/supplier-assessment/post-session-feedback")
  }

  @Test
  fun `appointment behaviour recorded event does not send email when user details are not available`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      notifyService().onApplicationEvent(appointmentEvent(AppointmentEventType.BEHAVIOUR_RECORDED, true))
    }
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment behaviour recorded event does not send email when notifyPP is false`() {
    notifyService().onApplicationEvent(appointmentEvent(AppointmentEventType.BEHAVIOUR_RECORDED, false))
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment behaviour recorded event calls email client`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("abc", "abc@abc.com"))

    notifyService().onApplicationEvent(appointmentEvent(AppointmentEventType.BEHAVIOUR_RECORDED, true))
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("template"), eq("abc@abc.com"), personalisationCaptor.capture())
    Assertions.assertThat(personalisationCaptor.firstValue["ppFirstName"]).isEqualTo("abc")
    Assertions.assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("JS18726AC")
    Assertions.assertThat(personalisationCaptor.firstValue["sessionUrl"]).isEqualTo("http://example.com/probation-practitioner/referrals/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080/supplier-assessment/post-session-feedback")
  }

  @Test
  fun `appointment event does not send email for appointment event time service delivery`() {
    notifyService().onApplicationEvent(appointmentEvent(AppointmentEventType.BEHAVIOUR_RECORDED, false, AppointmentType.SERVICE_DELIVERY))
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `appointment scheduled event sends email to pp`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("abc", "abc@abc.com"))

    notifyService().onApplicationEvent(appointmentEvent(AppointmentEventType.SCHEDULED, true))
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("template"), eq("abc@abc.com"), personalisationCaptor.capture())
    Assertions.assertThat(personalisationCaptor.firstValue["ppFirstName"]).isEqualTo("abc")
    Assertions.assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("JS18726AC")
    Assertions.assertThat(personalisationCaptor.firstValue["referralUrl"]).isEqualTo("http://example.com/probation-practitioner/referrals/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080/progress")
  }
}

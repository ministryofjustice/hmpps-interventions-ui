package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType.APPROVED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType.SUBMITTED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import java.time.OffsetDateTime
import java.util.UUID

class NotifyActionPlanServiceTest {
  private val emailSender = mock<EmailSender>()
  private val hmppsAuthService = mock<HMPPSAuthService>()
  private val referralService = mock<ReferralService>()
  private val actionPlanFactory = ActionPlanFactory()

  private val actionPlanSubmittedEvent = ActionPlanEvent(
    "source",
    SUBMITTED,
    SampleData.sampleActionPlan(
      id = UUID.fromString("42c7d267-0776-4272-a8e8-a673bfe30d0d"),
      referral = SampleData.sampleReferral(
        "X123456",
        "Harmony Living",
        id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
        referenceNumber = "HAS71263",
        sentAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
        sentBy = AuthUser("abc999", "auth", "abc999")
      ),
      submittedBy = AuthUser("abc123", "auth", "abc123")
    ),
    "http://localhost:8080/action-plan/42c7d267-0776-4272-a8e8-a673bfe30d0d",
  )

  private val actionPlanApprovedEvent = ActionPlanEvent(
    "source",
    APPROVED,
    actionPlanFactory.createApproved(
      id = UUID.fromString("42c7d267-0776-4272-a8e8-a673bfe30d0d"),
      submittedBy = AuthUser("abc123", "auth", "abc123"),
    ),
    "http://localhost:8080/referrals/42c7d267-0776-4272-a8e8-a673bfe30d0d",
  )

  private fun notifyService(): NotifyActionPlanService {
    return NotifyActionPlanService(
      "template",
      "template",
      "http://example.com",
      "/pp/referrals/{id}/action-plan",
      "/sp/referrals/{id}/action-plan",
      emailSender,
      hmppsAuthService,
      referralService,
    )
  }

  @Test
  fun `action plan submitted event does not send email when user details are not available`() {
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      notifyService().onApplicationEvent(actionPlanSubmittedEvent)
    }
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `action plan approved event does not send email when user details are not available`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenThrow(RuntimeException::class.java)
    assertThrows<RuntimeException> {
      notifyService().onApplicationEvent(actionPlanApprovedEvent)
    }
    verifyZeroInteractions(emailSender)
  }

  @Test
  fun `action plan approved event generates valid url and sends an email`() {
    val event = actionPlanApprovedEvent
    val actionPlan = event.actionPlan
    whenever(hmppsAuthService.getUserDetail(actionPlan.submittedBy!!))
      .thenReturn(UserDetail("tom", "tom@tom.tom"))

    notifyService().onApplicationEvent(actionPlanApprovedEvent)
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("template"), eq("tom@tom.tom"), personalisationCaptor.capture())
    assertThat(personalisationCaptor.firstValue["submitterFirstName"]).isEqualTo("tom")
    assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo(actionPlan.referral.referenceNumber)
    assertThat(personalisationCaptor.firstValue["actionPlanUrl"]).isEqualTo("http://example.com/sp/referrals/${actionPlan.referral.id}/action-plan")
  }

  @Test
  fun `action plan submitted event generates valid url and sends an email`() {
    whenever(referralService.getResponsibleProbationPractitioner(any()))
      .thenReturn(ContactableProbationPractitioner("tom", "tom@tom.tom"))

    notifyService().onApplicationEvent(actionPlanSubmittedEvent)
    val personalisationCaptor = argumentCaptor<Map<String, String>>()
    verify(emailSender).sendEmail(eq("template"), eq("tom@tom.tom"), personalisationCaptor.capture())
    assertThat(personalisationCaptor.firstValue["submitterFirstName"]).isEqualTo("tom")
    assertThat(personalisationCaptor.firstValue["referenceNumber"]).isEqualTo("HAS71263")
    assertThat(personalisationCaptor.firstValue["actionPlanUrl"]).isEqualTo("http://example.com/pp/referrals/${actionPlanSubmittedEvent.actionPlan.referral.id}/action-plan")
  }
}

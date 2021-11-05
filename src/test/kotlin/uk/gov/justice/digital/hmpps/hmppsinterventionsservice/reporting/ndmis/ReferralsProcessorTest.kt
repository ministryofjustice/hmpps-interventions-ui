package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis

import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance.ReferralsProcessor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime

internal class ReferralsProcessorTest {
  private val actionPlanService = mock<ActionPlanService>()
  private val processor = ReferralsProcessor(actionPlanService)

  private val referralFactory = ReferralFactory()
  private val appointmentFactory = AppointmentFactory()
  private val actionPlanFactory = ActionPlanFactory()

  @Test
  fun `will not process draft referrals`() {
    val referral = referralFactory.createDraft()

    assertThrows<RuntimeException> { processor.process(referral) }
  }

  @Test
  fun `referral correctly returns a referralData object`() {
    val actionPlanFirst = actionPlanFactory.createApproved(submittedAt = OffsetDateTime.now(), approvedAt = OffsetDateTime.now())
    val actionPlanSecond = actionPlanFactory.createApproved(submittedAt = OffsetDateTime.now().plusDays(1), approvedAt = OffsetDateTime.now().plusDays(1))
    val referral = referralFactory.createSent(actionPlans = mutableListOf(actionPlanFirst, actionPlanSecond))

    whenever(actionPlanService.getAllAttendedAppointments(anyOrNull())).thenReturn(listOf(appointmentFactory.create()))

    val result = processor.process(referral)!!

    assertThat(result.referralReference).isEqualTo(referral.referenceNumber)
    assertThat(result.referralId).isEqualTo(referral.id)
    assertThat(result.contractReference).isEqualTo(referral.intervention.dynamicFrameworkContract.contractReference)
    assertThat(result.contractType).isEqualTo(referral.intervention.dynamicFrameworkContract.contractType.name)
    assertThat(result.primeProvider).isEqualTo(referral.intervention.dynamicFrameworkContract.primeProvider.name)
    assertThat(result.relevantSentanceId).isEqualTo(1234567L)
    assertThat(result.serviceUserCRN).isEqualTo("X123456")
    assertThat(result.dateReferralReceived).isEqualTo(referral.sentAt)
    assertThat(result.firstActionPlanSubmittedAt).isEqualTo(actionPlanFirst.submittedAt)
    assertThat(result.firstActionPlanApprovedAt).isEqualTo(actionPlanFirst.approvedAt)
    assertThat(result.numberOfOutcomes).isEqualTo(referral.selectedDesiredOutcomes?.size)
    assertThat(result.achievementScore).isEqualTo(referral.endOfServiceReport?.achievementScore)
    assertThat(result.numberOfSessions).isEqualTo(referral.approvedActionPlan?.numberOfSessions)
    assertThat(result.numberOfSessionsAttended).isEqualTo(1)
    assertThat(result.endRequestedAt).isEqualTo(referral.endRequestedAt)
    assertThat(result.endRequestedReason).isEqualTo(referral.endRequestedReason?.description)
    assertThat(result.eosrSubmittedAt).isEqualTo(referral.endOfServiceReport?.submittedAt)
    assertThat(result.endReasonCode).isEqualTo(referral.endRequestedReason?.code)
    assertThat(result.endReasonDescription).isEqualTo(referral.endRequestedComments)
    assertThat(result.concludedAt).isEqualTo(referral.concludedAt)
  }
}

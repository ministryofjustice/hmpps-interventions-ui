package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.firstValue
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.same
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.EndOfServiceReportFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime

internal class ReferralConcluderTest {

  private val referralRepository: ReferralRepository = mock()
  private val actionPlanRepository: ActionPlanRepository = mock()
  private val referralEventPublisher: ReferralEventPublisher = mock()

  private val referralFactory = ReferralFactory()
  private val actionPlanFactory = ActionPlanFactory()
  private val endOfServiceReportFactory = EndOfServiceReportFactory()

  private val referralConcluder = ReferralConcluder(
    referralRepository, actionPlanRepository, referralEventPublisher
  )

  @Test
  fun `concludes referral as cancelled when ending a referral with no action plan`() {

    val timeAtStart = OffsetDateTime.now()
    val referralWithNoActionPlan = referralFactory.createSent()

    referralConcluder.concludeIfEligible(referralWithNoActionPlan)

    verifySaveWithConcludedAtSet(referralWithNoActionPlan, timeAtStart)
    verifyEventPublished(referralWithNoActionPlan, ReferralEventType.CANCELLED)
  }

  @Test
  fun `concludes referral as cancelled when ending a referral with no appointments attended`() {
    val timeAtStart = OffsetDateTime.now()
    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndNoAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    whenever(actionPlanRepository.countNumberOfAttendedSessions(referralWithActionPlanAndNoAttendedAppointments.id)).thenReturn(0)

    referralConcluder.concludeIfEligible(referralWithActionPlanAndNoAttendedAppointments)

    verifySaveWithConcludedAtSet(referralWithActionPlanAndNoAttendedAppointments, timeAtStart)
    verifyEventPublished(referralWithActionPlanAndNoAttendedAppointments, ReferralEventType.CANCELLED)
  }

  @Test
  fun `concludes referral as prematurely ended when ending a referral with some appointments attended and an end of service report submitted`() {

    val timeAtStart = OffsetDateTime.now()
    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndSomeAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    referralWithActionPlanAndSomeAttendedAppointments.endOfServiceReport = endOfServiceReportFactory.create(submittedAt = OffsetDateTime.now())
    whenever(actionPlanRepository.countNumberOfAttendedSessions(actionPlan.id)).thenReturn(1)

    referralConcluder.concludeIfEligible(referralWithActionPlanAndSomeAttendedAppointments)

    verifySaveWithConcludedAtSet(referralWithActionPlanAndSomeAttendedAppointments, timeAtStart)
    verifyEventPublished(referralWithActionPlanAndSomeAttendedAppointments, ReferralEventType.PREMATURELY_ENDED)
  }

  @Test
  fun `concludes referral as completed when ending a referral with all appointments attended and an end of service report submitted`() {

    val timeAtStart = OffsetDateTime.now()
    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndSomeAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    referralWithActionPlanAndSomeAttendedAppointments.endOfServiceReport = endOfServiceReportFactory.create(submittedAt = OffsetDateTime.now())
    whenever(actionPlanRepository.countNumberOfAttendedSessions(actionPlan.id)).thenReturn(2)

    referralConcluder.concludeIfEligible(referralWithActionPlanAndSomeAttendedAppointments)

    verifySaveWithConcludedAtSet(referralWithActionPlanAndSomeAttendedAppointments, timeAtStart)
    verifyEventPublished(referralWithActionPlanAndSomeAttendedAppointments, ReferralEventType.COMPLETED)
  }

  @Test
  fun `does not conclude a referral when ending a referral with some appointments attended and an end of service report has not been submitted`() {

    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndSomeAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    referralWithActionPlanAndSomeAttendedAppointments.endOfServiceReport = endOfServiceReportFactory.create(submittedAt = null)
    whenever(actionPlanRepository.countNumberOfAttendedSessions(actionPlan.id)).thenReturn(1)

    referralConcluder.concludeIfEligible(referralWithActionPlanAndSomeAttendedAppointments)

    verifyZeroInteractions(referralRepository, referralEventPublisher)
  }

  @Test
  fun `does not conclude a referral when ending a referral with all appointments attended and an end of service report has not been submitted`() {

    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndSomeAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    referralWithActionPlanAndSomeAttendedAppointments.endOfServiceReport = endOfServiceReportFactory.create(submittedAt = null)
    whenever(actionPlanRepository.countNumberOfAttendedSessions(actionPlan.id)).thenReturn(2)

    referralConcluder.concludeIfEligible(referralWithActionPlanAndSomeAttendedAppointments)

    verifyZeroInteractions(referralRepository, referralEventPublisher)
  }

  @Test
  fun `does not conclude a referral when ending a referral with some appointments attended and an end of service report does not exist`() {

    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndSomeAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    whenever(actionPlanRepository.countNumberOfAttendedSessions(actionPlan.id)).thenReturn(1)

    referralConcluder.concludeIfEligible(referralWithActionPlanAndSomeAttendedAppointments)

    verifyZeroInteractions(referralRepository, referralEventPublisher)
  }

  @Test
  fun `does not conclude a referral when ending a referral with all appointments attended and an end of service report does not exit`() {

    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndSomeAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    whenever(actionPlanRepository.countNumberOfAttendedSessions(actionPlan.id)).thenReturn(2)

    referralConcluder.concludeIfEligible(referralWithActionPlanAndSomeAttendedAppointments)

    verifyZeroInteractions(referralRepository, referralEventPublisher)
  }

  @Test
  fun `should flag end of service report as required when at least one session has been attended`() {

    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndSomeAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    whenever(actionPlanRepository.countNumberOfAttendedSessions(actionPlan.id)).thenReturn(1)

    val endOfServiceReportRequired = referralConcluder.requiresEndOfServiceReport(referralWithActionPlanAndSomeAttendedAppointments)

    assertThat(endOfServiceReportRequired).isTrue
    verifyZeroInteractions(referralRepository, referralEventPublisher)
  }

  @Test
  fun `should not flag end of service report as required when no sessions have been attended`() {

    val actionPlan = actionPlanFactory.create(numberOfSessions = 2)
    val referralWithActionPlanAndSomeAttendedAppointments = referralFactory.createSent(actionPlan = actionPlan)
    whenever(actionPlanRepository.countNumberOfAttendedSessions(actionPlan.id)).thenReturn(0)

    val endOfServiceReportRequired = referralConcluder.requiresEndOfServiceReport(referralWithActionPlanAndSomeAttendedAppointments)

    assertThat(endOfServiceReportRequired).isFalse
    verifyZeroInteractions(referralRepository, referralEventPublisher)
  }

  private fun verifyEventPublished(referralWithNoActionPlan: Referral, value: ReferralEventType) {
    verify(referralEventPublisher).referralConcludedEvent(same(referralWithNoActionPlan), same(value))
  }

  private fun verifySaveWithConcludedAtSet(referralWithNoActionPlan: Referral, timeAtStart: OffsetDateTime?) {
    val argumentCaptor: ArgumentCaptor<Referral> = ArgumentCaptor.forClass(Referral::class.java)
    verify(referralRepository).save(argumentCaptor.capture())
    assertThat(argumentCaptor.firstValue).isSameAs(referralWithNoActionPlan)
    assertThat(argumentCaptor.firstValue.concludedAt).isAfter(timeAtStart)
  }
}

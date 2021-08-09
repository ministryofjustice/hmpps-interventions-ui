package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance.PerformanceReportProcessor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.lang.RuntimeException
import java.time.OffsetDateTime
import java.util.UUID

internal class PerformanceReportDataProcessorTest {
  private val referralRepository = mock<ReferralRepository>()
  private val actionPlanSessionRepository = mock<ActionPlanSessionRepository>()
  private val processor = PerformanceReportProcessor(referralRepository, actionPlanSessionRepository)
  private val actionPlanFactory = ActionPlanFactory()
  private val referralFactory = ReferralFactory()
  private val appointmentFactory = AppointmentFactory()

  @Test
  fun `will not process draft referrals`() {
    whenever(referralRepository.findByIdAndSentAtIsNotNull(any())).thenReturn(null)

    assertThrows<RuntimeException> { processor.process(UUID.randomUUID()) }
  }

  @Test
  fun `getAllAttendedDeliveryAppointments gets appointments from all action plans and all sessions`() {
    val referral = referralFactory.createSent()

    // start by making a couple of action plans. we will intentionally duplicate sessions and appointments
    // on these to validate that the logic does not include duplicate attended appointments
    val actionPlan1 = actionPlanFactory.createApproved(referral = referral)
    val actionPlan2 = actionPlanFactory.createApproved(referral = referral)
    val actionPlan3 = actionPlanFactory.createSubmitted(referral = referral)
    referral.actionPlans = mutableListOf(actionPlan1, actionPlan2, actionPlan3)

    // then make a bunch of appointments
    val unattendedAppointments = (1..5).map {
      appointmentFactory.create(referral = referral)
    }
    val attendedAppointments = (1..5).map {
      appointmentFactory.create(referral = referral, attended = Attended.YES, appointmentFeedbackSubmittedAt = OffsetDateTime.now())
    }
    val lateAppointments = (1..5).map {
      appointmentFactory.create(referral = referral, attended = Attended.LATE, appointmentFeedbackSubmittedAt = OffsetDateTime.now())
    }

    // now we'll make a bunch of sessions with various unattended and attended appointments on them
    val session1 = ActionPlanSession(
      appointments = mutableSetOf(
        unattendedAppointments[0],
        unattendedAppointments[1],
        lateAppointments[0]
      ),
      1, actionPlan1, UUID.randomUUID()
    )

    val session2 = ActionPlanSession(
      appointments = mutableSetOf(unattendedAppointments[2], attendedAppointments[0]),
      2,
      actionPlan1,
      UUID.randomUUID()
    )

    val session3 = ActionPlanSession(
      appointments = mutableSetOf(
        unattendedAppointments[3],
        unattendedAppointments[4],
        lateAppointments[1]
      ),
      3, actionPlan1, UUID.randomUUID()
    )

    whenever(actionPlanSessionRepository.findAllByActionPlanId(actionPlan1.id)).thenReturn(listOf(session1, session2, session3))
    // weird duplicate behaviour is intended - even though it's not very realistic
    whenever(actionPlanSessionRepository.findAllByActionPlanId(actionPlan2.id)).thenReturn(listOf(session1, session2, session3))
    whenever(actionPlanSessionRepository.findAllByActionPlanId(actionPlan3.id)).thenReturn(emptyList())

    assertThat(processor.getAllAttendedDeliveryAppointments(referral)).hasSameElementsAs(listOf(lateAppointments[0], lateAppointments[1], attendedAppointments[0]))
  }

  @Test
  fun `getAllAttendedDeliveryAppointments returns empty list when referral has null or no action plans`() {
    val referral = referralFactory.createSent()
    referral.actionPlans = null
    assertThat(processor.getAllAttendedDeliveryAppointments(referral)).isEqualTo(emptyList<Appointment>())

    referral.actionPlans = mutableListOf()
    assertThat(processor.getAllAttendedDeliveryAppointments(referral)).isEqualTo(emptyList<Appointment>())
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.batch.item.ItemProcessor
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.util.UUID

@Component
class PerformanceReportProcessor(
  private val referralRepository: ReferralRepository,
  private val actionPlanSessionRepository: ActionPlanSessionRepository,
) : ItemProcessor<UUID, PerformanceReportData> {
  companion object : KLogging()

  override fun process(referralId: UUID): PerformanceReportData {
    logger.info("processing referral {}", kv("referralId", referralId))

    val referral = referralRepository.findByIdAndSentAtIsNotNull(referralId)
      ?: throw RuntimeException("invalid referral id passed to report processor")

    // note: all referrals here are 'sent', we can safely access fields like 'referenceNumber'
    val contract = referral.intervention.dynamicFrameworkContract
    val initialAssessmentAppointment = referral.supplierAssessment?.currentAppointment

    return PerformanceReportData(
      referralReference = referral.referenceNumber!!,
      referralId = referral.id,
      contractReference = contract.contractReference,
      organisationId = contract.primeProvider.id,
      currentAssigneeId = referral.currentAssignee?.id,
      serviceUserCRN = referral.serviceUserCRN,
      dateReferralReceived = referral.sentAt!!,
      initialAssessmentBookedAt = initialAssessmentAppointment?.createdAt,
      initialAssessmentAttendedAt = initialAssessmentAppointment?.attended?.let { initialAssessmentAppointment.appointmentTime },
      firstActionPlanSubmittedAt = referral.actionPlans?.mapNotNull { it.submittedAt }?.minOrNull(),
      firstActionPlanApprovedAt = referral.actionPlans?.mapNotNull { it.approvedAt }?.minOrNull(),
      firstSessionAttendedAt = getFirstAttendedDeliveryAppointment(referral)?.appointmentTime,
      numberOfOutcomes = referral.selectedDesiredOutcomes?.size,
      achievementScore = referral.endOfServiceReport?.achievementScore,
      numberOfSessions = referral.approvedActionPlan?.numberOfSessions,
      numberOfSessionsAttended = getAllAttendedDeliveryAppointments(referral).size,
      endRequestedAt = referral.endRequestedAt,
      endRequestedReason = referral.endRequestedReason?.code,
      eosrSubmittedAt = referral.endOfServiceReport?.submittedAt,
      concludedAt = referral.concludedAt,
    )
  }

  fun getAllAttendedDeliveryAppointments(referral: Referral): List<Appointment> {
    // a referral can have multiple action plans, each action plan can have multiple
    // sessions, each session can have multiple appointments. action plans may or
    // may not contain references to the same sessions and appointments depending
    // on implementation details. to be safe we get a list of all unique attended
    // appointments for all action plans and sessions associated with this referral.
    return referral.actionPlans?.flatMap { actionPlan ->
      actionPlanSessionRepository.findAllByActionPlanId(actionPlan.id)
        .flatMap { session -> session.appointments }
        .filter { appointment ->
          appointment.appointmentFeedbackSubmittedAt != null &&
            listOf(Attended.LATE, Attended.YES).contains(appointment.attended)
        }
    }?.distinctBy { appointment -> appointment.id }.orEmpty()
  }

  fun getFirstAttendedDeliveryAppointment(referral: Referral): Appointment? {
    return getAllAttendedDeliveryAppointments(referral).minByOrNull { it.appointmentTime }
  }
}

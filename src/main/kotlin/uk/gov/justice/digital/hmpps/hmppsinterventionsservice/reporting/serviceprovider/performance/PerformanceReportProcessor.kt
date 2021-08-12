package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.batch.item.ItemProcessor
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import java.util.UUID

@Component
class PerformanceReportProcessor(
  private val referralRepository: ReferralRepository,
  private val actionPlanService: ActionPlanService,
) : ItemProcessor<UUID, PerformanceReportData> {
  companion object : KLogging()

  override fun process(referralId: UUID): PerformanceReportData {
    logger.info("processing referral {}", kv("referralId", referralId))

    val referral = referralRepository.findByIdAndSentAtIsNotNull(referralId)
      ?: throw RuntimeException("invalid referral id passed to report processor")

    // note: all referrals here are 'sent', we can safely access fields like 'referenceNumber'
    val contract = referral.intervention.dynamicFrameworkContract
    val initialAssessmentAppointment = referral.supplierAssessment?.currentAppointment
    val approvedActionPlan = referral.approvedActionPlan

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
      firstSessionAttendedAt = approvedActionPlan?.let { actionPlanService.getFirstAttendedAppointment(it)?.appointmentTime },
      numberOfOutcomes = referral.selectedDesiredOutcomes?.size,
      achievementScore = referral.endOfServiceReport?.achievementScore,
      numberOfSessions = approvedActionPlan?.numberOfSessions,
      numberOfSessionsAttended = approvedActionPlan?.let { actionPlanService.getAllAttendedAppointments(it).size },
      endRequestedAt = referral.endRequestedAt,
      endRequestedReason = referral.endRequestedReason?.code,
      eosrSubmittedAt = referral.endOfServiceReport?.submittedAt,
      concludedAt = referral.concludedAt,
    )
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.batch.item.ItemProcessor
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService

@Component
class PerformanceReportProcessor(
  private val actionPlanService: ActionPlanService,
) : ItemProcessor<Referral, PerformanceReportData> {
  companion object : KLogging()

  override fun process(referral: Referral): PerformanceReportData {
    logger.debug("processing referral {}", kv("referralId", referral.id))

    if (referral.sentAt == null) throw RuntimeException("invalid referral passed to report processor; referral has not been sent")

    // note: all referrals here are 'sent', we can safely access fields like 'referenceNumber'
    val contract = referral.intervention.dynamicFrameworkContract
    val approvedActionPlan = referral.approvedActionPlan
    val saa = referral.supplierAssessment

    return PerformanceReportData(
      referralReference = referral.referenceNumber!!,
      referralId = referral.id,
      contractReference = contract.contractReference,
      organisationId = contract.primeProvider.id,
      currentAssigneeEmail = referral.currentAssignee?.userName,
      serviceUserCRN = referral.serviceUserCRN,
      dateReferralReceived = referral.sentAt!!,
      firstActionPlanSubmittedAt = referral.actionPlans?.mapNotNull { it.submittedAt }?.minOrNull(),
      firstActionPlanApprovedAt = referral.actionPlans?.mapNotNull { it.approvedAt }?.minOrNull(),
      firstSessionAttendedAt = approvedActionPlan?.let { actionPlanService.getFirstAttendedAppointment(it)?.appointmentTime },
      numberOfOutcomes = referral.selectedDesiredOutcomes?.size,
      achievementScore = referral.endOfServiceReport?.achievementScore,
      numberOfSessions = approvedActionPlan?.numberOfSessions,
      numberOfSessionsAttended = approvedActionPlan?.let { actionPlanService.getAllAttendedAppointments(it).size },
      endRequestedAt = referral.endRequestedAt,
      endRequestedReason = referral.endRequestedReason?.description,
      eosrSubmittedAt = referral.endOfServiceReport?.submittedAt,
      concludedAt = referral.concludedAt,
      referralEndState = referral.endState,
      dateSupplierAssessmentBooked = saa?.firstAppointment?.createdAt,
      dateSupplierAssessmentFirstScheduledFor = saa?.firstAppointment?.appointmentTime,
      dateSupplierAssessmentFirstNotAttended = saa?.firstAppointmentWithNonAttendance?.appointmentTime,
      dateSupplierAssessmentFirstAttended = saa?.firstAttendedAppointment?.appointmentTime,
      supplierAssessmentAttendedOnTime = saa?.firstAttendedAppointment?.attended?.let { it == Attended.YES },
    )
  }
}

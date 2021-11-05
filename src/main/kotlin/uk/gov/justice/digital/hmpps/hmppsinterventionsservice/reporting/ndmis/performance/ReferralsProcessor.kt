package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import mu.KLogging
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.SentReferralProcessor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService

@Component
class ReferralsProcessor(
  private val actionPlanService: ActionPlanService,
) : SentReferralProcessor<ReferralsData> {
  companion object : KLogging()

  override fun processSentReferral(referral: Referral): ReferralsData {
    return ReferralsData(
      referralReference = referral.referenceNumber!!,
      referralId = referral.id,
      contractReference = referral.intervention.dynamicFrameworkContract.contractReference,
      contractType = referral.intervention.dynamicFrameworkContract.contractType.name,
      primeProvider = referral.intervention.dynamicFrameworkContract.primeProvider.name,
      referringOfficerId = referral.createdBy.userName,
      relevantSentanceId = referral.relevantSentenceId!!,
      serviceUserCRN = referral.serviceUserCRN,
      dateReferralReceived = referral.sentAt!!,
      firstActionPlanSubmittedAt = referral.actionPlans?.mapNotNull { it.submittedAt }?.minOrNull(),
      firstActionPlanApprovedAt = referral.actionPlans?.mapNotNull { it.approvedAt }?.minOrNull(),
      numberOfOutcomes = referral.selectedDesiredOutcomes?.size,
      achievementScore = referral.endOfServiceReport?.achievementScore,
      numberOfSessions = referral.approvedActionPlan?.numberOfSessions,
      numberOfSessionsAttended = referral.approvedActionPlan?.let { actionPlanService.getAllAttendedAppointments(it).size },
      endRequestedAt = referral.endRequestedAt,
      endRequestedReason = referral.endRequestedReason?.description,
      eosrSubmittedAt = referral.endOfServiceReport?.submittedAt,
      endReasonCode = referral.endRequestedReason?.code,
      endReasonDescription = referral.endRequestedComments,
      concludedAt = referral.concludedAt
    )
  }
}

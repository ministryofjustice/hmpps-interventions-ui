package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KotlinLogging
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType.CANCELLED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType.COMPLETED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType.PREMATURELY_ENDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.Objects.nonNull
import javax.transaction.Transactional

@Service
@Transactional
class ReferralConcluder(
  val referralRepository: ReferralRepository,
  val actionPlanRepository: ActionPlanRepository,
  val referralEventPublisher: ReferralEventPublisher,
) {
  companion object {
    private val logger = KotlinLogging.logger {}
  }

  fun concludeIfEligible(referral: Referral) {
    val concludedEventType = getConcludedEventType(referral)

    if (concludedEventType != null) {
      referral.concludedAt = OffsetDateTime.now()
      referralRepository.save(referral)
      referralEventPublisher.referralConcludedEvent(referral, concludedEventType)
    }
  }

  fun requiresEndOfServiceReportCreation(referral: Referral): Boolean {
    if (referral.endOfServiceReport != null)
      return false

    val totalNumberOfSessions = referral.actionPlan?.numberOfSessions ?: 0
    if (totalNumberOfSessions == 0)
      return false

    val numberOfSessionsAttempted = countSessionsAttempted(referral)
    val allSessionsAttempted = totalNumberOfSessions == numberOfSessionsAttempted
    if (allSessionsAttempted)
      return true

    val atLeastOneSessionAttempted = numberOfSessionsAttempted > 0
    if (atLeastOneSessionAttempted && referral.endRequestedAt != null)
      return true

    return false
  }

  private fun getConcludedEventType(referral: Referral): ReferralEventType? {

    val hasActionPlan = nonNull(referral.actionPlan)

    val numberOfAttemptedSessions = countSessionsAttempted(referral)
    val hasAttemptedNoSessions = numberOfAttemptedSessions == 0

    val totalNumberOfSessions = referral.actionPlan?.numberOfSessions ?: 0
    val hasAttemptedSomeSessions = totalNumberOfSessions > numberOfAttemptedSessions
    val hasAttemptedAllSessions = totalNumberOfSessions == numberOfAttemptedSessions

    val hasSubmittedEndOfServiceReport = referral.endOfServiceReport?.submittedAt?.let { true } ?: false

    if (!hasActionPlan)
      return CANCELLED

    if (hasAttemptedNoSessions)
      return CANCELLED

    if (hasAttemptedSomeSessions && hasSubmittedEndOfServiceReport)
      return PREMATURELY_ENDED

    if (hasAttemptedAllSessions && hasSubmittedEndOfServiceReport)
      return COMPLETED

    return null
  }

  private fun countSessionsAttempted(referral: Referral): Int {
    return referral.actionPlan?.let {
      actionPlanRepository.countNumberOfAttemptedSessions(it.id)
    } ?: 0
  }
}

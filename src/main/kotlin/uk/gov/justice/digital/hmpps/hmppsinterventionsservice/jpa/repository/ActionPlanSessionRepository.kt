package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import java.util.UUID

interface ActionPlanSessionRepository : JpaRepository<ActionPlanSession, UUID> {
  fun findAllByReferralId(referralId: UUID): List<ActionPlanSession>
  fun findByReferralIdAndSessionNumber(referralId: UUID, sessionNumber: Int): ActionPlanSession?

  @Query("select aps from ActionPlanSession aps left join ActionPlan ap on ap.referral = aps.referral where ap.id = :actionPlanId and aps.sessionNumber = :sessionNumber")
  fun findAllByActionPlanIdAndSessionNumber(actionPlanId: UUID, sessionNumber: Int): ActionPlanSession?
}

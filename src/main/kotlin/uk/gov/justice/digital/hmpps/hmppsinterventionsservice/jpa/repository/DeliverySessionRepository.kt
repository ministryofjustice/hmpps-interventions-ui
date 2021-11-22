package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DeliverySession
import java.util.UUID

interface DeliverySessionRepository : JpaRepository<DeliverySession, UUID> {
  fun findAllByReferralId(referralId: UUID): List<DeliverySession>
  fun findByReferralIdAndSessionNumber(referralId: UUID, sessionNumber: Int): DeliverySession?

  @Query("select aps from DeliverySession aps left join ActionPlan ap on ap.referral = aps.referral where ap.id = :actionPlanId and aps.sessionNumber = :sessionNumber")
  fun findAllByActionPlanIdAndSessionNumber(actionPlanId: UUID, sessionNumber: Int): DeliverySession?

  @Query("select ds from DeliverySession ds left join ActionPlan ap on ap.referral = ds.referral where ap.id = :actionPlanId")
  fun findAllByActionPlanId(actionPlanId: UUID): List<DeliverySession>
}

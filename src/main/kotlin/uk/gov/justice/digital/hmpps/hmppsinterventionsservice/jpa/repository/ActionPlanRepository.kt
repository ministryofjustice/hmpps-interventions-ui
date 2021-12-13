package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import java.util.UUID

interface ActionPlanRepository : JpaRepository<ActionPlan, UUID> {
  fun findByIdAndSubmittedAtIsNull(id: UUID): ActionPlan?
  fun findAllByReferralIdAndApprovedAtIsNotNull(referralId: UUID): List<ActionPlan>

  @Query(
    "select count(sesh) from DeliverySession sesh join sesh.appointments appt " +
      "where sesh.referral.id = :referralId and appt.attended is not null " +
      "and appt.appointmentFeedbackSubmittedAt is not null"
  )
  fun countNumberOfAttemptedSessions(referralId: UUID): Int
}
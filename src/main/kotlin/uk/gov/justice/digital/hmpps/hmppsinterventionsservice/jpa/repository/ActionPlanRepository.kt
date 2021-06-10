package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import java.util.UUID

interface ActionPlanRepository : JpaRepository<ActionPlan, UUID> {
  fun findByIdAndSubmittedAtIsNull(id: UUID): ActionPlan?
  fun findByReferralId(referralId: UUID): ActionPlan?
  fun existsByReferralId(referralId: UUID): Boolean

  @Query(
    "select count(sesh) from ActionPlanSession sesh join sesh.appointments appt " +
      "where sesh.actionPlan.id = :actionPlanId and (appt.attended = 'YES' or appt.attended = 'LATE')"
  )
  fun countNumberOfAttendedSessions(actionPlanId: UUID): Int
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import java.util.UUID

interface ActionPlanRepository : JpaRepository<ActionPlan, UUID> {
  fun findByIdAndSubmittedAtIsNull(id: UUID): ActionPlan?
  fun findByReferralId(referralId: UUID): ActionPlan?
}

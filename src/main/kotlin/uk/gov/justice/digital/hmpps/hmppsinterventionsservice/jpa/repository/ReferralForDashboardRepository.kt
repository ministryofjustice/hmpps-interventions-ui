package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralForDashboard
import java.util.UUID

interface ReferralForDashboardRepository : JpaRepository<ReferralForDashboard, UUID>, JpaSpecificationExecutor<ReferralForDashboard> {
  @EntityGraph(value = "entity-referral-graph")
  override fun findAll(spec: Specification<ReferralForDashboard>): List<ReferralForDashboard>
}

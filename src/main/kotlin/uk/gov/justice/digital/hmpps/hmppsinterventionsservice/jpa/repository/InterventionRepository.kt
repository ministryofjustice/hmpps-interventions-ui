package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import java.util.UUID

interface InterventionRepository : JpaRepository<Intervention, UUID>, InterventionFilterRepository {
  fun findByDynamicFrameworkContractPrimeProviderId(id: String): List<Intervention>
  fun findByDynamicFrameworkContractIdIn(ids: Iterable<UUID>): List<Intervention>
}

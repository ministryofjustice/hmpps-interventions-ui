package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import java.util.*

interface InterventionRepository : JpaRepository<Intervention, UUID>, InterventionFilterRepository {
  fun findByDynamicFrameworkContractServiceProviderId(id: String): List<Intervention>
}

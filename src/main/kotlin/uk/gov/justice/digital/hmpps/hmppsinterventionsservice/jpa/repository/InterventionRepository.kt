package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.repository.CrudRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import java.util.UUID

interface InterventionRepository : CrudRepository<Intervention, UUID> {
  fun findByDynamicFrameworkContractServiceProviderId(id: String): List<Intervention>
}

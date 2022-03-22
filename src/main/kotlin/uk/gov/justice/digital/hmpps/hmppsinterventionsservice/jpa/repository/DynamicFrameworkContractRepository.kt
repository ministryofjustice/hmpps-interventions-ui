package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.repository.CrudRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import java.util.UUID

interface DynamicFrameworkContractRepository : CrudRepository<DynamicFrameworkContract, UUID> {

  @EntityGraph(value = "entity-dynamicFrameWorkContract-graph")
  fun findAllByContractReferenceIn(references: List<String>): List<DynamicFrameworkContract>
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.repository.CrudRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegionID

interface PCCRegionRepository : CrudRepository<PCCRegion, PCCRegionID> {
  fun findAllByNpsRegionId(id: Char): List<PCCRegion>
  fun findAllByIdIn(id: List<String>): List<PCCRegion>
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository
import javax.transaction.Transactional

@Service
@Transactional
class PCCRegionService(val repository: PCCRegionRepository) {
  fun getAllPCCRegions(): List<PCCRegion> {
    return repository.findAll().toList()
  }
}

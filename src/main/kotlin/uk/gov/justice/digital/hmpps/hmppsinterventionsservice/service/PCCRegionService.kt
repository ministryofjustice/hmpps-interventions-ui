package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.PCCRegionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository

@Service
class PCCRegionService(
  val repository: PCCRegionRepository,
) {

  fun getAllPCCRegions(): List<PCCRegionDTO> {
    return repository.findAll().map { PCCRegionDTO.from(it) }
  }
}

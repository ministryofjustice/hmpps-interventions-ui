package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.PCCRegionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.PCCRegionService

@RestController
class PCCRegionController(
  private val pccRegionService: PCCRegionService,
) {

  @GetMapping("/pcc-regions")
  fun getAllPCCRegions(): List<PCCRegionDTO> {
    return pccRegionService.getAllPCCRegions()
  }
}

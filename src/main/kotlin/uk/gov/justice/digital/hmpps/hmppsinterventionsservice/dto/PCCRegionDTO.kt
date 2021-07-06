package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegionID

class PCCRegionDTO(
  val id: PCCRegionID,
  val name: String,
  val npsRegion: NPSRegionDTO,
) {
  companion object {
    fun from(pccRegion: PCCRegion): PCCRegionDTO {
      return PCCRegionDTO(
        id = pccRegion.id,
        name = pccRegion.name,
        npsRegion = NPSRegionDTO.from(pccRegion.npsRegion)
      )
    }
  }
}

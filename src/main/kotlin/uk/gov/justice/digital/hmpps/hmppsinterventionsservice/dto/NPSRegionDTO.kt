package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.NPSRegion

class NPSRegionDTO(
  val id: Char,
  val name: String,
) {
  companion object {
    fun from(npsRegion: NPSRegion): NPSRegionDTO {
      return NPSRegionDTO(
        id = npsRegion.id,
        name = npsRegion.name
      )
    }
  }
}

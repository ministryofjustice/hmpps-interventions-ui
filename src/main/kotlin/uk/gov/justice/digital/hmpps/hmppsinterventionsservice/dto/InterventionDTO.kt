package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention

data class InterventionDTO(
  val title: String,
  val description: String,
) {
  companion object {

    fun from(intervention: Intervention): InterventionDTO {
      return InterventionDTO(
        title = intervention.title,
        description = intervention.description,
      )
    }
  }
}

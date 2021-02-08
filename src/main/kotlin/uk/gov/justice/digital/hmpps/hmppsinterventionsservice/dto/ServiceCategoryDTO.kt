package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ComplexityLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import java.util.UUID

data class ServiceCategoryDTO(
  val id: UUID,
  val name: String,
  val complexityLevels: List<ComplexityLevel>,
  val desiredOutcomes: List<DesiredOutcome>
) {
  companion object {
    fun from(serviceCategory: ServiceCategory): ServiceCategoryDTO {
      return ServiceCategoryDTO(
        id = serviceCategory.id,
        name = serviceCategory.name,
        complexityLevels = serviceCategory.complexityLevels,
        desiredOutcomes = serviceCategory.desiredOutcomes
      )
    }
  }
}

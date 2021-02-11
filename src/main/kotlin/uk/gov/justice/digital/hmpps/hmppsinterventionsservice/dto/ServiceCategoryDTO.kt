package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import java.util.UUID

data class DesiredOutcomeDTO(
  val id: UUID,
  val description: String,
)

data class ComplexityLevelDTO(
  val id: UUID,
  val title: String,
  val description: String,
)

data class ServiceCategoryDTO(
  val id: UUID,
  val name: String,
  val complexityLevels: List<ComplexityLevelDTO>,
  val desiredOutcomes: List<DesiredOutcomeDTO>
) {
  companion object {
    fun from(serviceCategory: ServiceCategory): ServiceCategoryDTO {
      return ServiceCategoryDTO(
        id = serviceCategory.id,
        name = serviceCategory.name,
        complexityLevels = serviceCategory.complexityLevels.map { ComplexityLevelDTO(it.id, it.title, it.description) },
        desiredOutcomes = serviceCategory.desiredOutcomes.map { DesiredOutcomeDTO(it.id, it.description) },
      )
    }
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion
import java.util.UUID

data class InterventionDTO(
  val id: UUID,
  val title: String,
  val description: String,
  val npsRegion: NPSRegionDTO?,
  val pccRegions: List<PCCRegionDTO>,
  val serviceCategory: ServiceCategoryFullDTO,
  val serviceProvider: ServiceProviderDTO,
  val eligibility: ContractEligibilityDTO,
) {
  companion object {
    fun from(intervention: Intervention, pccRegions: List<PCCRegion>): InterventionDTO {
      val contract = intervention.dynamicFrameworkContract
      return InterventionDTO(
        id = intervention.id!!,
        title = intervention.title,
        description = intervention.description,
        npsRegion = contract.npsRegion?.let { NPSRegionDTO.from(it) },
        pccRegions = pccRegions.map { PCCRegionDTO.from(it) },
        serviceCategory = ServiceCategoryFullDTO.from(contract.serviceCategory),
        serviceProvider = ServiceProviderDTO.from(contract.serviceProvider),
        eligibility = ContractEligibilityDTO(
          contract.minimumAge,
          contract.maximumAge,
          contract.allowsFemale,
          contract.allowsMale,
        ),
      )
    }
  }
}

data class ContractEligibilityDTO(
  val minimumAge: Int,
  val maximumAge: Int?,
  val allowsFemale: Boolean,
  val allowsMale: Boolean,
)

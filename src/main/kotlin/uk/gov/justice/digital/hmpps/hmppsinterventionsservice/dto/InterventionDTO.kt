package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ContractEligibility
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import java.util.UUID

data class InterventionDTO(
  val id: UUID,
  val title: String,
  val description: String,
  val pccRegions: List<PCCRegionDTO>,
  val serviceCategory: ServiceCategoryDTO,
  val serviceProvider: ServiceProviderDTO,
  val eligibility: ContractEligibilityDTO,
) {
  companion object {

    fun from(intervention: Intervention, pccRegions: List<PCCRegionDTO>): InterventionDTO {
      val contract = intervention.dynamicFrameworkContract
      val contractEligibility = contract.contractEligibility
      return InterventionDTO(
        id = intervention.id!!,
        title = intervention.title,
        description = intervention.description,
        pccRegions = pccRegions,
        serviceCategory = ServiceCategoryDTO.from(contract.serviceCategory),
        serviceProvider = ServiceProviderDTO.from(contract.serviceProvider),
        eligibility = ContractEligibilityDTO.from(contractEligibility),
      )
    }
  }
}

class ContractEligibilityDTO(
  val minimumAge: Int,
  val maximumAge: Int?,
  val allowsFemale: Boolean,
  val allowsMale: Boolean,
) {
  companion object {
    fun from(contractEligibility: ContractEligibility): ContractEligibilityDTO {
      return ContractEligibilityDTO(
        minimumAge = contractEligibility.minimumAge,
        maximumAge = contractEligibility.maximumAge,
        allowsFemale = contractEligibility.allowsFemale,
        allowsMale = contractEligibility.allowsMale
      )
    }
  }
}

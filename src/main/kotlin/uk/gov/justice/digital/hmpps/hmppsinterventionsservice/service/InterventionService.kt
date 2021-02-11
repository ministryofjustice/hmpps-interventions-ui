package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.InterventionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.PCCRegionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository
import java.util.*


@Service
class InterventionService(
  val pccRegionRepository: PCCRegionRepository,
  val interventionRepository: InterventionRepository
) {

  fun getIntervention(id: UUID): InterventionDTO? {
    return interventionRepository.findByIdOrNull(id)?.let { InterventionDTO.from(it, getPCCRegions(it)) }
  }
  fun getInterventionsForServiceProvider(id: AuthGroupID): List<Intervention> {
    return interventionRepository.findByDynamicFrameworkContractServiceProviderId(id)
  }
  fun getAllInterventions(): List<InterventionDTO> {
    return interventionRepository.findAll().map {
      InterventionDTO.from(it, getPCCRegions(it))
    }
  }

  fun getAllFilteredInterventions(parameters: MutableMap<String, Array<String>>): List<InterventionDTO> {
    return interventionRepository.findByCriteria(parameters).map {
      InterventionDTO.from(it, getPCCRegions(it))
    }
  }

  private fun getPCCRegions(intervention: Intervention): List<PCCRegionDTO> {
    val contract = intervention.dynamicFrameworkContract
    return if (contract.pccRegion != null) {
      listOf(PCCRegionDTO.from(contract.pccRegion))
    } else {
      val pccRegions = pccRegionRepository.findAllByNpsRegionId(contract.npsRegion!!.id)
      pccRegions.map { PCCRegionDTO.from(it) }
    }
  }
}

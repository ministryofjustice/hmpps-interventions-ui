package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegionID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository
import java.util.UUID

@Service
class InterventionService(
  val pccRegionRepository: PCCRegionRepository,
  val interventionRepository: InterventionRepository
) {

  fun getIntervention(id: UUID): Intervention? {
    return interventionRepository.findByIdOrNull(id)
  }

  fun getInterventionsForServiceProvider(id: AuthGroupID): List<Intervention> {
    return interventionRepository.findByDynamicFrameworkContractPrimeProviderId(id)
  }

  fun getAllInterventions(): List<Intervention> {
    return interventionRepository.findAll()
  }

  fun getInterventions(
    pccRegionIds: List<PCCRegionID>,
    allowsFemale: Boolean?,
    allowsMale: Boolean?,
    minimumAge: Int?,
    maximumAge: Int?
  ): List<Intervention> {
    return interventionRepository.findByCriteria(pccRegionIds, allowsFemale, allowsMale, minimumAge, maximumAge)
  }

  fun getPCCRegions(intervention: Intervention): List<PCCRegion> {
    val contract = intervention.dynamicFrameworkContract
    return if (contract.pccRegion != null) {
      listOf(contract.pccRegion)
    } else {
      pccRegionRepository.findAllByNpsRegionId(contract.npsRegion!!.id)
    }
  }
}

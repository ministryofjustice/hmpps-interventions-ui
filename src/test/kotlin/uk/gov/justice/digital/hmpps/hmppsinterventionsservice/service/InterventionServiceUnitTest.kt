package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleIntervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleNPSRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.samplePCCRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository
import java.util.UUID

class InterventionServiceUnitTest {

  private val interventionRepository = mock<InterventionRepository>()
  private val pccRegionRepository = mock<PCCRegionRepository>()
  private val interventionService = InterventionService(pccRegionRepository, interventionRepository)

  @Test
  fun `finds interventions using search criteria`() {
    val locations = emptyList<String>()
    val interventions = emptyList<Intervention>()
    whenever(interventionRepository.findByCriteria(locations, null, null, null, null)).thenReturn(interventions)

    interventionService.getInterventions(locations, null, null, null, null)

    verify(interventionRepository).findByCriteria(locations, null, null, null, null)
  }

  @Test
  fun `should not look up regions for intervention containing contract with pcc region`() {
    val locations = emptyList<String>()
    val contract = sampleContract(primeProvider = sampleServiceProvider(), npsRegion = sampleNPSRegion(), pccRegion = samplePCCRegion())
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(locations, null, null, null, null)).thenReturn(interventions)

    interventionService.getInterventions(locations, null, null, null, null)

    verifyZeroInteractions(pccRegionRepository)
  }

  @Test
  fun `should return an intervention`() {
    val locations = emptyList<String>()
    val npsRegion = sampleNPSRegion()
    val pccRegion = samplePCCRegion()
    val contract = sampleContract(primeProvider = sampleServiceProvider(), npsRegion = npsRegion)
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(locations, null, null, null, null)).thenReturn(interventions)
    whenever(pccRegionRepository.findAllByNpsRegionId(npsRegion.id)).thenReturn(listOf(pccRegion))

    val interventionDTOs = interventionService.getInterventions(locations, null, null, null, null)

    assertEquals(interventionDTOs.size, interventions.size)
  }

  @Test
  fun `should return an intervention with allowsFemale parameter`() {
    val npsRegion = sampleNPSRegion()
    val pccRegion = samplePCCRegion()
    val contract = sampleContract(primeProvider = sampleServiceProvider(), npsRegion = npsRegion)
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(listOf(), true, null, null, null)).thenReturn(interventions)
    whenever(pccRegionRepository.findAllByNpsRegionId(npsRegion.id)).thenReturn(listOf(pccRegion))

    val interventionDTOs = interventionService.getInterventions(listOf(), true, null, null, null)

    assertEquals(interventionDTOs.size, interventions.size)
  }

  @Test
  fun `should return an intervention with allowsMale parameter`() {
    val npsRegion = sampleNPSRegion()
    val pccRegion = samplePCCRegion()
    val contract = sampleContract(primeProvider = sampleServiceProvider(), npsRegion = npsRegion)
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(listOf(), null, true, null, null)).thenReturn(interventions)
    whenever(pccRegionRepository.findAllByNpsRegionId(npsRegion.id)).thenReturn(listOf(pccRegion))

    val interventionDTOs = interventionService.getInterventions(listOf(), null, true, null, null)

    assertEquals(interventionDTOs.size, interventions.size)
  }

  @Test
  fun `should return an intervention with minimum age parameter`() {
    val npsRegion = sampleNPSRegion()
    val pccRegion = samplePCCRegion()
    val contract = sampleContract(primeProvider = sampleServiceProvider(), npsRegion = npsRegion)
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(listOf(), null, null, 18, null)).thenReturn(interventions)
    whenever(pccRegionRepository.findAllByNpsRegionId(npsRegion.id)).thenReturn(listOf(pccRegion))

    val interventionDTOs = interventionService.getInterventions(listOf(), null, null, 18, null)

    assertEquals(interventionDTOs.size, interventions.size)
  }

  @Test
  fun `should return an intervention with maximum age parameter`() {
    val npsRegion = sampleNPSRegion()
    val pccRegion = samplePCCRegion()
    val contract = sampleContract(primeProvider = sampleServiceProvider(), npsRegion = npsRegion)
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(listOf(), null, null, null, 25)).thenReturn(interventions)
    whenever(pccRegionRepository.findAllByNpsRegionId(npsRegion.id)).thenReturn(listOf(pccRegion))

    val interventionDTOs = interventionService.getInterventions(listOf(), null, null, null, 25)

    assertEquals(interventionDTOs.size, interventions.size)
  }
}

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
    whenever(interventionRepository.findByCriteria(locations)).thenReturn(interventions)

    interventionService.getInterventions(locations)

    verify(interventionRepository).findByCriteria(locations)
  }

  @Test
  fun `should not look up regions for intervention containing contract with pcc region`() {
    val locations = emptyList<String>()
    val contract = sampleContract(serviceCategory = sampleServiceCategory(), serviceProvider = sampleServiceProvider(), npsRegion = sampleNPSRegion(), pccRegion = samplePCCRegion())
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(locations)).thenReturn(interventions)

    interventionService.getInterventions(locations)

    verifyZeroInteractions(pccRegionRepository)
  }

  @Test
  fun `looks up regions for intervention containing contract without pcc region using nps region`() {
    val locations = emptyList<String>()
    val npsRegion = sampleNPSRegion()
    val pccRegion = samplePCCRegion()
    val contract = sampleContract(serviceCategory = sampleServiceCategory(), serviceProvider = sampleServiceProvider(), npsRegion = npsRegion)
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(locations)).thenReturn(interventions)
    whenever(pccRegionRepository.findAllByNpsRegionId(npsRegion.id)).thenReturn(listOf(pccRegion))

    interventionService.getInterventions(locations)

    verify(pccRegionRepository).findAllByNpsRegionId(npsRegion.id)
  }

  @Test
  fun `should return an intervention`() {
    val locations = emptyList<String>()
    val npsRegion = sampleNPSRegion()
    val pccRegion = samplePCCRegion()
    val contract = sampleContract(serviceCategory = sampleServiceCategory(), serviceProvider = sampleServiceProvider(), npsRegion = npsRegion)
    val intervention = sampleIntervention(id = UUID.randomUUID(), dynamicFrameworkContract = contract)
    val interventions = listOf(intervention)
    whenever(interventionRepository.findByCriteria(locations)).thenReturn(interventions)
    whenever(pccRegionRepository.findAllByNpsRegionId(npsRegion.id)).thenReturn(listOf(pccRegion))

    val interventionDTOs = interventionService.getInterventions(locations)

    assertEquals(interventionDTOs.size, interventions.size)
  }
}

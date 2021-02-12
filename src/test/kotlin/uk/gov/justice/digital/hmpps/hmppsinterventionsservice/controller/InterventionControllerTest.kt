package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.InterventionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.InterventionService

internal class InterventionControllerTest {
  private val interventionService = mock<InterventionService>()
  private val interventionController = InterventionController(interventionService)

  @Test
  fun `getInterventions returns interventions based on filtering`() {
    val locations = emptyList<String>()
    val interventionDTOs = emptyList<InterventionDTO>()
    whenever(interventionService.getInterventions(locations)).thenReturn(interventionDTOs)

    val responseDTOs = interventionController.getInterventions(locations)

    verify(interventionService).getInterventions(locations)
    assertSame(interventionDTOs, responseDTOs)
  }

  @Test
  fun `getInterventions returns interventions unfiltered when no parameters supplied`() {
    val locations: List<String>? = null
    val interventionDTOs = emptyList<InterventionDTO>()
    whenever(interventionService.getInterventions(emptyList())).thenReturn(interventionDTOs)

    val responseDTOs = interventionController.getInterventions(locations)

    verify(interventionService).getInterventions(emptyList())
    assertSame(interventionDTOs, responseDTOs)
  }
}

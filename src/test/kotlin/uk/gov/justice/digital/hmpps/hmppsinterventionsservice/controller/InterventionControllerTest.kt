package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.InterventionService

internal class InterventionControllerTest {
  private val interventionService = mock<InterventionService>()
  private val interventionController = InterventionController(interventionService)

  @Test
  fun `getInterventions returns interventions based on filtering`() {
    val locations = emptyList<String>()
    val interventions = emptyList<Intervention>()
    whenever(interventionService.getInterventions(locations, allowsFemale = true, allowsMale = true, 18, 25)).thenReturn(interventions)

    val responseDTOs = interventionController.getInterventions(locations, allowsFemale = true, allowsMale = true, 18, 25)

    verify(interventionService).getInterventions(locations, allowsFemale = true, allowsMale = true, 18, 25)

    responseDTOs.forEachIndexed { i, it ->
      assertSame(it.id, responseDTOs[i].id)
    }
  }

  @Test
  fun `getInterventions returns interventions unfiltered when no parameters supplied`() {
    val locations: List<String>? = null
    val interventions = emptyList<Intervention>()
    whenever(interventionService.getInterventions(emptyList(), null, null, null, null)).thenReturn(interventions)

    val responseDTOs = interventionController.getInterventions(locations, null, null, null, null)

    verify(interventionService).getInterventions(emptyList(), null, null, null, null)
    responseDTOs.forEachIndexed { i, it ->
      assertSame(it.id, responseDTOs[i].id)
    }
  }
}

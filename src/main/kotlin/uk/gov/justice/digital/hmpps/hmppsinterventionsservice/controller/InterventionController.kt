package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.InterventionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.InterventionService
import java.util.UUID

@RestController
class InterventionController(
  private val interventionService: InterventionService,
) {

  @GetMapping("/intervention/{id}")
  fun getInterventionByID(@PathVariable id: UUID): InterventionDTO {

    return interventionService.getIntervention(id)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "intervention not found [id=$id]")
  }

  @GetMapping("/interventions")
  fun getInterventions(
    @RequestParam(name = "pccRegionIds", required = false) pccRegionIds: List<String>?,
    @RequestParam(name = "allowsFemale", required = false) allowsFemale: Boolean?,
    @RequestParam(name = "allowsMale", required = false) allowsMale: Boolean?,
  ): List<InterventionDTO> {

    return interventionService.getInterventions(pccRegionIds.orEmpty(), allowsFemale, allowsMale)
  }
}

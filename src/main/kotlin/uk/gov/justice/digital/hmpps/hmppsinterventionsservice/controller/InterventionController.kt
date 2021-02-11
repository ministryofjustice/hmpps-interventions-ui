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
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@RestController
class InterventionController(
  private val interventionService: InterventionService,
) {

  @GetMapping("/intervention/{id}")
  fun getInterventionByID(@PathVariable id: UUID ): InterventionDTO {

    return interventionService.getIntervention(id)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "intervention not found [id=$id]")
  }

  @GetMapping("/interventions")
  fun getAllInterventions(
    request: HttpServletRequest,
    response: HttpServletResponse,
    @RequestParam(required = false) location: String?): List<InterventionDTO> {

    val locations = location
    val parameters = request.parameterMap
//    return interventionService.getAllInterventions()
    return interventionService.getAllFilteredInterventions(parameters)
  }
}

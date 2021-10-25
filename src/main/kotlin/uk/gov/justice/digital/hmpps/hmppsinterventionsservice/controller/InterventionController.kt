package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceProviderAccessScopeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.InterventionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegionID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.InterventionService
import java.util.UUID

@RestController
class InterventionController(
  private val interventionService: InterventionService,
  private val userMapper: UserMapper,
  private val serviceProviderAccessScopeMapper: ServiceProviderAccessScopeMapper,
) {
  @GetMapping("/intervention/{id}")
  fun getInterventionByID(@PathVariable id: UUID): InterventionDTO {
    return interventionService.getIntervention(id)?.let {
      InterventionDTO.from(it, interventionService.getPCCRegions(it))
    } ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "intervention not found [id=$id]")
  }

  @GetMapping("/my-interventions")
  fun getInterventionsForUser(authenticationToken: JwtAuthenticationToken): List<InterventionDTO> {
    // this endpoint returns the interventions in the authenticated user's 'access scope'.
    // what this means is interventions for which the user has the relevant contract
    val user = userMapper.fromToken(authenticationToken)
    val accessScope = serviceProviderAccessScopeMapper.fromUser(user)
    return interventionService.getInterventionsForServiceProviderScope(accessScope)
      .map { InterventionDTO.from(it, interventionService.getPCCRegions(it)) }
  }

  @GetMapping("/interventions")
  fun getInterventions(
    @RequestParam(name = "pccRegionIds", required = false) pccRegionIds: List<PCCRegionID>?,
    @RequestParam(name = "allowsFemale", required = false) allowsFemale: Boolean?,
    @RequestParam(name = "allowsMale", required = false) allowsMale: Boolean?,
    @RequestParam(name = "minimumAge", required = false) minimumAge: Int?,
    @RequestParam(name = "maximumAge", required = false) maximumAge: Int?
  ): List<InterventionDTO> {
    return interventionService.getInterventions(pccRegionIds.orEmpty(), allowsFemale, allowsMale, minimumAge, maximumAge)
      .map { InterventionDTO.from(it, interventionService.getPCCRegions(it)) }
  }
}

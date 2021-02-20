package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.ActionPlanMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.parseID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService

@RestController
class ActionPlanController(
  val actionPlanMapper: ActionPlanMapper,
  val jwtAuthUserMapper: JwtAuthUserMapper,
  val actionPlanService: ActionPlanService
) {

  @PostMapping("/draft-action-plan")
  fun createDraftActionPlan(
    @RequestBody createActionPlanDTO: CreateActionPlanDTO,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<DraftActionPlanDTO> {

    val createdByUser = jwtAuthUserMapper.map(authentication)
    val createActionPlanActivities = actionPlanMapper.map(createActionPlanDTO.activities)

    val draftActionPlan = actionPlanService.createDraftReferral(
      createActionPlanDTO.referralId,
      createActionPlanDTO.numberOfSessions,
      createActionPlanActivities,
      createdByUser
    )

    val draftActionPlanDTO = actionPlanMapper.map(draftActionPlan)
    val location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(draftActionPlan.id).toUri()
    return ResponseEntity.created(location).body(draftActionPlanDTO)
  }

  @GetMapping("/draft-action-plan/{id}")
  fun getDraftActionPlan(@PathVariable id: String): DraftActionPlanDTO {

    val uuid = parseID(id)
    return actionPlanService.getDraftReferral(uuid)
      ?.let { actionPlanMapper.map(it) }
      ?: throw ResponseStatusException(NOT_FOUND, "draft action plan not found [id=$uuid]")
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.ActionPlanMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import java.util.UUID

@RestController
class ActionPlanController(
  val actionPlanMapper: ActionPlanMapper,
  val jwtAuthUserMapper: JwtAuthUserMapper,
  val actionPlanService: ActionPlanService,
  val locationMapper: LocationMapper
) {

  @PostMapping("/draft-action-plan")
  fun createDraftActionPlan(
    @RequestBody createActionPlanDTO: CreateActionPlanDTO,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<DraftActionPlanDTO> {

    val createdByUser = jwtAuthUserMapper.map(authentication)
    val createActionPlanActivities = actionPlanMapper.map(createActionPlanDTO.activities)

    val draftActionPlan = actionPlanService.createDraftActionPlan(
      createActionPlanDTO.referralId,
      createActionPlanDTO.numberOfSessions,
      createActionPlanActivities,
      createdByUser
    )

    val draftActionPlanDTO = DraftActionPlanDTO.from(draftActionPlan)
    val location = locationMapper.mapToCurrentRequestBasePath("/{id}", draftActionPlanDTO.id)
    return ResponseEntity.created(location).body(draftActionPlanDTO)
  }

  @GetMapping("/draft-action-plan/{id}")
  fun getDraftActionPlan(@PathVariable id: UUID): DraftActionPlanDTO {
    return actionPlanService.getDraftActionPlan(id)
      ?.let { DraftActionPlanDTO.from(it) }
      ?: throw ResponseStatusException(NOT_FOUND, "draft action plan not found [id=$id]")
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.ActionPlanMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtToAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService

@RestController
class ActionPlanController(
  val actionPlanMapper: ActionPlanMapper,
  val jwtToAuthUserMapper: JwtToAuthUserMapper,
  val actionPlanService: ActionPlanService
) {

  @PostMapping("/draft-action-plan")
  fun createDraftActionPlan(
    @RequestBody createActionPlanDTO: CreateActionPlanDTO,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<DraftActionPlanDTO> {

    val createdByUser = jwtToAuthUserMapper.parseAuthUserToken(authentication)
    val createActionPlan = actionPlanMapper.map(createActionPlanDTO, createdByUser)
    val draftActionPlan = actionPlanService.createDraftReferral(createActionPlan)
    val draftActionPlanDTO = actionPlanMapper.map(draftActionPlan)
    val location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(draftActionPlan.id).toUri()
    return ResponseEntity.created(location).body(draftActionPlanDTO)
  }
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.ActionPlanMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateActionPlanDTO
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
    val createActionPlanActivities = actionPlanMapper.mapActionPlanActivityDtoToActionPlanActivity(createActionPlanDTO.activities)

    val draftActionPlan = actionPlanService.createDraftActionPlan(
      createActionPlanDTO.referralId,
      createActionPlanDTO.numberOfSessions,
      createActionPlanActivities,
      createdByUser
    )

    val draftActionPlanDTO = DraftActionPlanDTO.from(draftActionPlan)
    val location = locationMapper.mapToCurrentRequestBasePath("/{id}", draftActionPlanDTO.id)
    return ResponseEntity.created(location.toUri()).body(draftActionPlanDTO)
  }

  @PostMapping("/draft-action-plan/{id}/submit")
  fun submitDraftActionPlan(
    @PathVariable id: UUID,
    authentication: JwtAuthenticationToken,
  ): ResponseEntity<ActionPlanDTO> {
    val submittedByUser = jwtAuthUserMapper.map(authentication)
    val submittedActionPlan = actionPlanService.submitDraftActionPlan(id, submittedByUser)

    val actionPlanDTO = ActionPlanDTO.from(submittedActionPlan)
    val location = locationMapper.mapToCurrentContextPathAsString("/action-plan/{id}", actionPlanDTO.id)
    return ResponseEntity.created(location.toUri()).body(actionPlanDTO)
  }

  @GetMapping("/draft-action-plan/{id}")
  fun getDraftActionPlan(@PathVariable id: UUID): DraftActionPlanDTO {
    val draftActionPlan = actionPlanService.getDraftActionPlan(id)
    return DraftActionPlanDTO.from(draftActionPlan)
  }

  @PatchMapping("/draft-action-plan/{id}")
  fun updateDraftActionPlan(
    @PathVariable id: UUID,
    @RequestBody update: UpdateActionPlanDTO,
  ): DraftActionPlanDTO {
    val activityUpdate = update.activity?.let { actionPlanMapper.mapActionPlanActivityDtoToActionPlanActivity(it) }
    val updatedActionPlan = actionPlanService.updateActionPlan(id, update.numberOfSessions, activityUpdate)

    return DraftActionPlanDTO.from(updatedActionPlan)
  }

  @GetMapping("/action-plan/{id}")
  fun getActionPlan(@PathVariable id: UUID): ActionPlanDTO {
    val actionPlan = actionPlanService.getActionPlan(id)
    return ActionPlanDTO.from(actionPlan)
  }
}

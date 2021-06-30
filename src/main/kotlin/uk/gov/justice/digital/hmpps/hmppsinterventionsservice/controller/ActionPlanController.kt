package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.AccessError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import java.util.UUID

@RestController
class ActionPlanController(
  val userMapper: UserMapper,
  val actionPlanService: ActionPlanService,
  val locationMapper: LocationMapper,
  val userTypeChecker: UserTypeChecker,
) {

  @PostMapping("/draft-action-plan")
  fun createDraftActionPlan(
    @RequestBody createActionPlanDTO: CreateActionPlanDTO,
    authentication: JwtAuthenticationToken
  ): ResponseEntity<ActionPlanDTO> {

    val draftActionPlan = actionPlanService.createDraftActionPlan(
      createActionPlanDTO.referralId,
      createActionPlanDTO.numberOfSessions,
      createActionPlanDTO.activities.map { ActionPlanActivity(description = it.description) },
      userMapper.fromToken(authentication),
    )

    val actionPlanDTO = ActionPlanDTO.from(draftActionPlan)
    val location = locationMapper.expandPathToCurrentRequestBaseUrl("/{id}", draftActionPlan.id)
    return ResponseEntity.created(location).body(actionPlanDTO)
  }

  @PostMapping("/draft-action-plan/{id}/submit")
  fun submitDraftActionPlan(
    @PathVariable id: UUID,
    authentication: JwtAuthenticationToken,
  ): ResponseEntity<ActionPlanDTO> {
    val submittedByUser = userMapper.fromToken(authentication)
    val submittedActionPlan = actionPlanService.submitDraftActionPlan(id, submittedByUser)

    val actionPlanDTO = ActionPlanDTO.from(submittedActionPlan)
    val location = locationMapper.expandPathToCurrentRequestBaseUrl("/action-plan/{id}", actionPlanDTO.id)
    return ResponseEntity.created(location).body(actionPlanDTO)
  }

  @PatchMapping("/draft-action-plan/{id}")
  fun updateDraftActionPlan(
    @PathVariable id: UUID,
    @RequestBody update: UpdateActionPlanDTO,
  ): ActionPlanDTO {
    val updatedActionPlan = actionPlanService.updateActionPlan(
      id,
      update.numberOfSessions,
      update.newActivity?.let { ActionPlanActivity(description = it.description) },
    )

    return ActionPlanDTO.from(updatedActionPlan)
  }

  @PatchMapping("/action-plan/{actionPlanId}/activities/{activityId}")
  fun updateActionPlanActivity(
    @PathVariable actionPlanId: UUID,
    @PathVariable activityId: UUID,
    @RequestBody update: UpdateActionPlanActivityDTO,
  ): ActionPlanDTO {
    val updatedActionPlan = actionPlanService.updateActionPlanActivity(actionPlanId, activityId, update.description)
    return ActionPlanDTO.from(updatedActionPlan)
  }

  @GetMapping("/action-plan/{id}")
  fun getActionPlan(@PathVariable id: UUID): ActionPlanDTO {
    val actionPlan = actionPlanService.getActionPlan(id)
    return ActionPlanDTO.from(actionPlan)
  }

  @PostMapping("/action-plan/{id}/approve")
  fun approveActionPlan(@PathVariable id: UUID, authentication: JwtAuthenticationToken): ActionPlanDTO {
    val user = userMapper.fromToken(authentication)

    if (!userTypeChecker.isProbationPractitionerUser(user)) {
      throw AccessError(user, "could not approve action plan", listOf("only probation practitioners can approve action plans"))
    }

    return ActionPlanDTO.from(actionPlanService.approveActionPlan(id, user))
  }
}

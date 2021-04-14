package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.apache.http.HttpStatus
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.ActionPlanMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import java.net.URI
import java.time.OffsetDateTime
import java.util.UUID

internal class ActionPlanControllerTest {

  private val actionPlanMapper = mock<ActionPlanMapper>()
  private val jwtAuthUserMapper = mock<JwtAuthUserMapper>()
  private val actionPlanService = mock<ActionPlanService>()
  private val locationMapper = mock<LocationMapper>()

  private val actionPlanController = ActionPlanController(actionPlanMapper, jwtAuthUserMapper, actionPlanService, locationMapper)

  @Test
  fun `saves draft action plan`() {
    val referralId = UUID.randomUUID()
    val numberOfSessions = 5
    val activitiesDTO = emptyList<CreateActionPlanActivityDTO>()
    val createActionPlanDTO = CreateActionPlanDTO(referralId, 5, activitiesDTO)
    val jwtAuthenticationToken = JwtAuthenticationToken(mock())
    val authUser = AuthUser("CRN123", "auth", "user")
    val actionPlan = SampleData.sampleActionPlan()
    val activities = emptyList<ActionPlanActivity>()
    val actionPlanDTO = ActionPlanDTO.from(actionPlan)
    val uri = URI.create("http://localhost/1234")

    whenever(jwtAuthUserMapper.map(jwtAuthenticationToken)).thenReturn(authUser)
    whenever(actionPlanMapper.mapActionPlanActivityDtoToActionPlanActivity(activitiesDTO)).thenReturn(activities)
    whenever(actionPlanService.createDraftActionPlan(referralId, numberOfSessions, activities, authUser)).thenReturn(actionPlan)
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl("/{id}", actionPlanDTO.id)).thenReturn(uri)

    val draftActionPlanResponse = actionPlanController.createDraftActionPlan(createActionPlanDTO, jwtAuthenticationToken)

    assertThat(draftActionPlanResponse.let { it.body }).isEqualTo(actionPlanDTO)
    assertThat(draftActionPlanResponse.let { it.headers["location"] }).isEqualTo(listOf(uri.toString()))
  }

  @Test
  fun `successfully update a draft action plan containing an activity`() {
    val draftActionPlanId = UUID.randomUUID()
    val desiredOutcome = DesiredOutcome(UUID.randomUUID(), "Des Out", UUID.randomUUID())
    val activityDTO = CreateActionPlanActivityDTO(desiredOutcome.id, "Description")
    val activityUpdate = ActionPlanActivity("Description", OffsetDateTime.now(), desiredOutcome)
    whenever(actionPlanMapper.mapActionPlanActivityDtoToActionPlanActivity(activityDTO)).thenReturn(activityUpdate)

    val updatedActionPlan = SampleData.sampleActionPlan(id = draftActionPlanId)
    whenever(actionPlanService.updateActionPlan(draftActionPlanId, 1, activityUpdate)).thenReturn(updatedActionPlan)

    val updateActionPlanDTO = UpdateActionPlanDTO(1, activityDTO)

    val draftActionPlanResponse = actionPlanController.updateDraftActionPlan(draftActionPlanId, updateActionPlanDTO)

    assertThat(draftActionPlanResponse).isEqualTo(ActionPlanDTO.from(updatedActionPlan))
  }

  @Test
  fun `successfully update a draft action plan without an activity`() {
    val draftActionPlanId = UUID.randomUUID()

    val updatedActionPlan = SampleData.sampleActionPlan(id = draftActionPlanId)
    whenever(actionPlanService.updateActionPlan(draftActionPlanId, 1, null)).thenReturn(updatedActionPlan)

    val updateActionPlanDTO = UpdateActionPlanDTO(1, null)

    val draftActionPlanResponse = actionPlanController.updateDraftActionPlan(draftActionPlanId, updateActionPlanDTO)

    verifyZeroInteractions(actionPlanMapper)
    assertThat(draftActionPlanResponse).isEqualTo(ActionPlanDTO.from(updatedActionPlan))
  }

  @Test
  fun `submits a draft action plan`() {
    val actionPlanId = UUID.randomUUID()
    val jwtAuthenticationToken = JwtAuthenticationToken(mock())
    val authUser = AuthUser("CRN123", "auth", "user")
    whenever(jwtAuthUserMapper.map(jwtAuthenticationToken)).thenReturn(authUser)

    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    whenever(actionPlanService.submitDraftActionPlan(actionPlanId, authUser)).thenReturn(actionPlan)

    val uri = URI.create("http://localhost/action-plan/1234")
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl("/action-plan/{id}", actionPlan.id)).thenReturn(uri)

    val responseEntity = actionPlanController.submitDraftActionPlan(actionPlanId, jwtAuthenticationToken)

    assertThat(responseEntity.statusCode.value()).isEqualTo(HttpStatus.SC_CREATED)
    assertThat(responseEntity.headers["location"]).isEqualTo(listOf(uri.toString()))
    assertThat(responseEntity.body).isEqualTo(ActionPlanDTO.from(actionPlan))
  }

  @Test
  fun `gets action plan`() {
    val actionPlan = SampleData.sampleActionPlan()
    whenever(actionPlanService.getActionPlan(actionPlan.id)).thenReturn(actionPlan)

    val retrievedActionPlan = actionPlanController.getActionPlan(actionPlan.id)

    assertThat(retrievedActionPlan).isNotNull
  }

  @Test
  fun `gets action plan by referral id`() {
    val actionPlan = SampleData.sampleActionPlan()
    val referralId = actionPlan.referral.id
    whenever(actionPlanService.getActionPlanByReferral(referralId)).thenReturn(actionPlan)

    val retrievedActionPlan = actionPlanController.getActionPlanByReferral(referralId)

    assertThat(retrievedActionPlan).isNotNull
  }

  @Test
  fun `update action plan activity`() {
    val actionPlan = SampleData.sampleActionPlan()
    val activityId = UUID.randomUUID()
    val desiredOutcomeId = UUID.randomUUID()
    val description = "description"

    val updateActionPlanActivityDTO = UpdateActionPlanActivityDTO("description", desiredOutcomeId)

    whenever(actionPlanService.updateActionPlanActivity(actionPlan.id, activityId, description, desiredOutcomeId))
      .thenReturn(actionPlan)

    val updatedActionPlanDTO = actionPlanController.updateActionPlanActivity(actionPlan.id, activityId, updateActionPlanActivityDTO)
    assertThat(updatedActionPlanDTO).isEqualTo(ActionPlanDTO.from(actionPlan))
  }
}

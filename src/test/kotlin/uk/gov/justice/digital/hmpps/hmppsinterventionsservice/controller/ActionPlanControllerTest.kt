package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.apache.http.HttpStatus
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import java.net.URI
import java.util.UUID

internal class ActionPlanControllerTest {
  private val actionPlanFactory = ActionPlanFactory()
  private val tokenFactory = JwtTokenFactory()
  private val userMapper = mock<UserMapper>()
  private val actionPlanService = mock<ActionPlanService>()
  private val locationMapper = mock<LocationMapper>()
  private val userTypeChecker = mock<UserTypeChecker>()

  private val actionPlanController = ActionPlanController(
    userMapper,
    actionPlanService,
    locationMapper,
    userTypeChecker,
  )

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

    whenever(userMapper.fromToken(jwtAuthenticationToken)).thenReturn(authUser)
    whenever(actionPlanService.createDraftActionPlan(referralId, numberOfSessions, activities, authUser)).thenReturn(actionPlan)
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl("/{id}", actionPlanDTO.id)).thenReturn(uri)

    val draftActionPlanResponse = actionPlanController.createDraftActionPlan(createActionPlanDTO, jwtAuthenticationToken)

    assertThat(draftActionPlanResponse.let { it.body }).isEqualTo(actionPlanDTO)
    assertThat(draftActionPlanResponse.let { it.headers["location"] }).isEqualTo(listOf(uri.toString()))
  }

  @Test
  fun `successfully update a draft action plan containing an activity`() {
    val actionPlan = actionPlanFactory.create()
    val activityDTO = CreateActionPlanActivityDTO("Description")

    whenever(actionPlanService.updateActionPlan(eq(actionPlan.id), eq(1), any())).thenReturn(actionPlan)

    val updateActionPlanDTO = UpdateActionPlanDTO(1, activityDTO)
    val draftActionPlanResponse = actionPlanController.updateDraftActionPlan(actionPlan.id, updateActionPlanDTO)

    assertThat(draftActionPlanResponse).isEqualTo(ActionPlanDTO.from(actionPlan))
  }

  @Test
  fun `successfully update a draft action plan without an activity`() {
    val actionPlan = actionPlanFactory.create()

    whenever(actionPlanService.updateActionPlan(actionPlan.id, 1, null)).thenReturn(actionPlan)

    val updateActionPlanDTO = UpdateActionPlanDTO(1, null)
    val draftActionPlanResponse = actionPlanController.updateDraftActionPlan(actionPlan.id, updateActionPlanDTO)

    assertThat(draftActionPlanResponse).isEqualTo(ActionPlanDTO.from(actionPlan))
  }

  @Test
  fun `submits a draft action plan`() {
    val actionPlanId = UUID.randomUUID()
    val jwtAuthenticationToken = JwtAuthenticationToken(mock())
    val authUser = AuthUser("CRN123", "auth", "user")
    whenever(userMapper.fromToken(jwtAuthenticationToken)).thenReturn(authUser)

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
    val description = "description"

    val updateActionPlanActivityDTO = UpdateActionPlanActivityDTO("description")

    whenever(actionPlanService.updateActionPlanActivity(actionPlan.id, activityId, description))
      .thenReturn(actionPlan)

    val updatedActionPlanDTO = actionPlanController.updateActionPlanActivity(actionPlan.id, activityId, updateActionPlanActivityDTO)
    assertThat(updatedActionPlanDTO).isEqualTo(ActionPlanDTO.from(actionPlan))
  }
}

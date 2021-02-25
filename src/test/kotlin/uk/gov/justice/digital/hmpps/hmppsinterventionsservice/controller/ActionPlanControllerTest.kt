package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.ActionPlanMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import java.net.URI
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
    val draftActionPlanDTO = DraftActionPlanDTO.from(actionPlan)
    val uri = URI.create("/1234")

    whenever(jwtAuthUserMapper.map(jwtAuthenticationToken)).thenReturn(authUser)
    whenever(actionPlanMapper.mapActionPlanActivityDtoToActionPlanActivity(activitiesDTO)).thenReturn(activities)
    whenever(actionPlanService.createDraftActionPlan(referralId, numberOfSessions, activities, authUser)).thenReturn(actionPlan)
    whenever(locationMapper.mapToCurrentRequestBasePath("/{id}", draftActionPlanDTO.id)).thenReturn(uri)

    val draftActionPlanResponse = actionPlanController.createDraftActionPlan(createActionPlanDTO, jwtAuthenticationToken)

    assertThat(draftActionPlanResponse.let { it.body }).isEqualTo(draftActionPlanDTO)
    assertThat(draftActionPlanResponse.let { it.headers["location"] }).isEqualTo(listOf("/1234"))
  }

  @Test
  fun `gets draft action plan using id`() {
    val actionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    val draftActionPlanDTO = DraftActionPlanDTO.from(actionPlan)

    whenever(actionPlanService.getDraftActionPlan(actionPlanId)).thenReturn(actionPlan)

    val draftActionPlanResponse = actionPlanController.getDraftActionPlan(actionPlanId)

    assertThat(draftActionPlanResponse).isEqualTo(draftActionPlanDTO)
  }

  @Test
  fun `successfully update a draft action plan`() {
    val draftActionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = draftActionPlanId)
    val draftActionPlanDTO = DraftActionPlanDTO.from(SampleData.sampleActionPlan(id = draftActionPlanId, numberOfSessions = 5))

    val updatedActionPlan = SampleData.sampleActionPlan(numberOfSessions = 5)

    whenever(actionPlanMapper.mapActionPlanDtoToActionPlan(draftActionPlanId, draftActionPlanDTO)).thenReturn(actionPlan)
    whenever(actionPlanService.updateActionPlan(actionPlan)).thenReturn(updatedActionPlan)

    val draftActionPlanResponse = actionPlanController.updateDraftActionPlan(draftActionPlanId, draftActionPlanDTO)

    verify(actionPlanMapper).mapActionPlanDtoToActionPlan(draftActionPlanId, draftActionPlanDTO)
    verify(actionPlanService).updateActionPlan(actionPlan)
    assertThat(draftActionPlanResponse).isEqualTo(DraftActionPlanDTO.from(updatedActionPlan))
  }
}

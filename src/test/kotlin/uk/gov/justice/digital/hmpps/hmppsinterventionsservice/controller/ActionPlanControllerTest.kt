package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.ActionPlanMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AuthUserDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
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
    val authUserDTO = AuthUserDTO("CRN123", "user")
    val actionPlanId = UUID.randomUUID()
    val draftActionPlanDTO = DraftActionPlanDTO(actionPlanId, referralId, 5, emptyList(), authUserDTO, OffsetDateTime.now())
    val uri = URI.create("/1234")

    whenever(jwtAuthUserMapper.map(jwtAuthenticationToken)).thenReturn(authUser)
    whenever(actionPlanMapper.map(activitiesDTO)).thenReturn(activities)
    whenever(actionPlanService.createDraftActionPlan(referralId, numberOfSessions, activities, authUser)).thenReturn(actionPlan)
    whenever(actionPlanMapper.map(actionPlan)).thenReturn(draftActionPlanDTO)
    whenever(locationMapper.map("/{id}", draftActionPlanDTO.id)).thenReturn(uri)

    val draftActionPlanResponse = actionPlanController.createDraftActionPlan(createActionPlanDTO, jwtAuthenticationToken)

    assertThat(draftActionPlanResponse.let { it.body }).isSameAs(draftActionPlanDTO)
    assertThat(draftActionPlanResponse.let { it.headers["location"] }).isEqualTo(listOf("/1234"))
  }

  @Test
  fun `gets draft action plan using id`() {
    val actionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    val authUserDTO = AuthUserDTO("CRN123", "user")
    val draftActionPlanDTO = DraftActionPlanDTO(actionPlanId, UUID.randomUUID(), 5, emptyList(), authUserDTO, OffsetDateTime.now())

    whenever(actionPlanService.getDraftActionPlan(actionPlanId)).thenReturn(actionPlan)
    whenever(actionPlanMapper.map(actionPlan)).thenReturn(draftActionPlanDTO)

    val draftActionPlanResponse = actionPlanController.getDraftActionPlan(actionPlanId.toString())

    assertThat(draftActionPlanResponse).isSameAs(draftActionPlanDTO)
  }

  @Test
  fun `throws exception id action plan does not exist`() {
    val actionPlanId = UUID.randomUUID()

    whenever(actionPlanService.getDraftActionPlan(actionPlanId)).thenReturn(null)

    val exception = assertThrows(ResponseStatusException::class.java) {
      actionPlanController.getDraftActionPlan(actionPlanId.toString())
    }

    assertThat(exception.status).isEqualTo(NOT_FOUND)
    assertThat(exception.reason).isEqualTo("draft action plan not found [id=$actionPlanId]")
  }
}

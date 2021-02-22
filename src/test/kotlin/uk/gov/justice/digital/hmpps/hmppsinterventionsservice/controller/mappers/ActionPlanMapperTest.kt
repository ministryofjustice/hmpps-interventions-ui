package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DesiredOutcomeDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import java.time.OffsetDateTime
import java.util.UUID

internal class ActionPlanMapperTest {

  private val desiredOutcomeRepository = mock<DesiredOutcomeRepository>()

  private val actionPlanMapper = ActionPlanMapper(desiredOutcomeRepository)

  @Test
  fun `converts to a list of action plan activity from a dto`() {
    val desiredOutcomeDTO = DesiredOutcomeDTO(UUID.randomUUID(), "desire")
    val createdAt = OffsetDateTime.now()
    val createActionPlanActivityDTO = CreateActionPlanActivityDTO(desiredOutcomeDTO, "description", createdAt)
    val desiredOutcome = DesiredOutcome(desiredOutcomeDTO.id, "desire", UUID.randomUUID())
    whenever(desiredOutcomeRepository.getOne(desiredOutcomeDTO.id)).thenReturn(desiredOutcome)

    val activities = actionPlanMapper.map(listOf(createActionPlanActivityDTO))

    assertThat(activities.size).isEqualTo(1)
    assertThat(activities.first().desiredOutcome).isEqualTo(desiredOutcome)
    assertThat(activities.first().description).isEqualTo("description")
    assertThat(activities.first().createdAt).isEqualTo(createdAt)
  }

  @Test
  fun `converts from an action plan to a dto`() {
    val actionPlan = SampleData.sampleActionPlan()

    val draftActionPlanDTO = actionPlanMapper.map(actionPlan)

    assertThat(draftActionPlanDTO.id).isEqualTo(actionPlan.id)
    assertThat(draftActionPlanDTO.referralId).isEqualTo(actionPlan.referral.id)
    assertThat(draftActionPlanDTO.numberOfSessions).isEqualTo(actionPlan.numberOfSessions)
    assertThat(draftActionPlanDTO.createdBy.username).isEqualTo(actionPlan.createdBy.userName)
    assertThat(draftActionPlanDTO.createdBy.authSource).isEqualTo(actionPlan.createdBy.authSource)
    assertThat(draftActionPlanDTO.createdAt).isEqualTo(actionPlan.createdAt)
  }
}

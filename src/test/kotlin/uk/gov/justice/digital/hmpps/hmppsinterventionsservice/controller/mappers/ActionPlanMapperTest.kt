package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DesiredOutcomeDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.Optional
import java.util.UUID

internal class ActionPlanMapperTest {

  private val desiredOutcomeRepository = mock<DesiredOutcomeRepository>()
  private val referralRepository = mock<ReferralRepository>()

  private val actionPlanMapper = ActionPlanMapper(desiredOutcomeRepository, referralRepository)

  @Test
  fun `converts to a list of action plan activity from a dto`() {
    val desiredOutcomeDTO = DesiredOutcomeDTO(UUID.randomUUID(), "desire")
    val createdAt = OffsetDateTime.now()
    val createActionPlanActivityDTO = CreateActionPlanActivityDTO(desiredOutcomeDTO, "description", createdAt)
    val desiredOutcome = DesiredOutcome(desiredOutcomeDTO.id, "desire", UUID.randomUUID())
    whenever(desiredOutcomeRepository.findById(desiredOutcomeDTO.id)).thenReturn(Optional.of(desiredOutcome))

    val activities = actionPlanMapper.map(listOf(createActionPlanActivityDTO))

    assertThat(activities.size).isEqualTo(1)
    assertThat(activities.first().desiredOutcome).isEqualTo(desiredOutcome)
    assertThat(activities.first().description).isEqualTo("description")
    assertThat(activities.first().createdAt).isEqualTo(createdAt)
  }

  @Test
  fun `converts to action plan from a dto`() {
    val draftActionPlanId = UUID.randomUUID()

    val desiredOutcomeDTO = DesiredOutcomeDTO(UUID.randomUUID(), "desire")
    val desiredOutcome = DesiredOutcome(desiredOutcomeDTO.id, "desire", UUID.randomUUID())
    val activities = SampleData.sampleActionPlanActivity(desiredOutcome)
    val referral = SampleData.sampleReferral(id = UUID.fromString("222ED289-8412-41A9-8291-45E33E60276C"), crn = "CRN123", serviceProviderName = "SP")

    val actionPlanDto = DraftActionPlanDTO.from(SampleData.sampleActionPlan(id = draftActionPlanId, activities = listOf(activities)))

    whenever(desiredOutcomeRepository.findById(any())).thenReturn(Optional.of(desiredOutcome))
    whenever(referralRepository.findById(any())).thenReturn(Optional.of(referral))

    val mappedActionPlan = actionPlanMapper.map(draftActionPlanId, actionPlanDto)

    assertThat(mappedActionPlan.referral).isEqualTo(referral)
    assertThat(mappedActionPlan.id).isEqualTo(actionPlanDto.id)
    assertThat(mappedActionPlan.createdAt).isEqualTo(actionPlanDto.createdAt)
    assertThat(mappedActionPlan.activities[0].createdAt).isEqualTo(actionPlanDto.activities[0].createdAt)
    assertThat(mappedActionPlan.activities[0].description).isEqualTo(actionPlanDto.activities[0].description)
    assertThat(mappedActionPlan.activities[0].desiredOutcome.description).isEqualTo(actionPlanDto.activities[0].desiredOutcome.description)
    assertThat(mappedActionPlan.activities[0].desiredOutcome.id).isEqualTo(actionPlanDto.activities[0].desiredOutcome.id)
  }
}

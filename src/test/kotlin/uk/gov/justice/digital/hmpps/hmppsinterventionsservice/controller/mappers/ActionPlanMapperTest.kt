package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanActivityDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
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
    val desiredOutcomeId = UUID.randomUUID()
    val createdAt = OffsetDateTime.now()
    val createActionPlanActivityDTO = CreateActionPlanActivityDTO(desiredOutcomeId, "description")
    val desiredOutcome = DesiredOutcome(desiredOutcomeId, "desire", UUID.randomUUID())
    whenever(desiredOutcomeRepository.findById(desiredOutcomeId)).thenReturn(Optional.of(desiredOutcome))

    val activities = actionPlanMapper.mapActionPlanActivityDtoToActionPlanActivity(listOf(createActionPlanActivityDTO))

    assertThat(activities.size).isEqualTo(1)
    assertThat(activities.first().desiredOutcome).isEqualTo(desiredOutcome)
    assertThat(activities.first().description).isEqualTo("description")
    assertThat(activities.first().createdAt).isAfter(createdAt)
  }
}

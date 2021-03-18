package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateEndOfServiceReportOutcomeDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AchievementLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import java.util.Optional
import java.util.UUID

class EndOfServiceReportOutcomeMapperTest {

  private val desiredOutcomeRepository = mock<DesiredOutcomeRepository>()

  private val endOfServiceReportOutcomeMapper = EndOfServiceReportOutcomeMapper(desiredOutcomeRepository)

  @Test
  fun `converts createEndOfServiceReportOutcomeDto to endOfServiceReportOutcome`() {
    val desiredOutcomeId = UUID.randomUUID()
    val createEndOfServiceReportOutcomeDTO =
      CreateEndOfServiceReportOutcomeDTO(desiredOutcomeId, AchievementLevel.ACHIEVED, null, null)

    val desiredOutcome = DesiredOutcome(desiredOutcomeId, "desire", UUID.randomUUID())
    whenever(desiredOutcomeRepository.findById(desiredOutcomeId)).thenReturn(Optional.of(desiredOutcome))

    val mappedEndOfServiceReportOutcome =
      endOfServiceReportOutcomeMapper.mapCreateEndOfServiceReportOutcomeDtoToEndOfServiceReportOutcome(createEndOfServiceReportOutcomeDTO)

    assertThat(mappedEndOfServiceReportOutcome.desiredOutcome).isEqualTo(desiredOutcome)
    assertThat(mappedEndOfServiceReportOutcome.achievementLevel).isEqualTo(AchievementLevel.ACHIEVED)
    assertThat(mappedEndOfServiceReportOutcome.additionalTaskComments).isEqualTo(null)
    assertThat(mappedEndOfServiceReportOutcome.progressionComments).isEqualTo(null)
  }
}

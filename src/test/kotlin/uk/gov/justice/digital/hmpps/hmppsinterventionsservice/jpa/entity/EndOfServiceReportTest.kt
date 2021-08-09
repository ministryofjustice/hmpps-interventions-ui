package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DesiredOutcomesFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.EndOfServiceReportFactory
import java.time.OffsetDateTime

internal class EndOfServiceReportTest {
  private val endOfServiceReportFactory = EndOfServiceReportFactory()
  private val desiredOutcomesFactory = DesiredOutcomesFactory()

  @Nested
  inner class AchievementScore {
    @Test
    fun `achievementScore returns 0 when the eosr is not submitted`() {
      val desiredOutcomes = desiredOutcomesFactory.create(number = 4)
      val eosr = endOfServiceReportFactory.create(
        outcomes = mutableSetOf(
          EndOfServiceReportOutcome(desiredOutcomes[0], AchievementLevel.ACHIEVED),
          EndOfServiceReportOutcome(desiredOutcomes[1], AchievementLevel.ACHIEVED),
          EndOfServiceReportOutcome(desiredOutcomes[2], AchievementLevel.PARTIALLY_ACHIEVED),
          EndOfServiceReportOutcome(desiredOutcomes[3], AchievementLevel.NOT_ACHIEVED),
        )
      )
      assertThat(eosr.achievementScore).isEqualTo(0f)
    }

    @Test
    fun `achievementScore returns a correct floating point value`() {
      val desiredOutcomes = desiredOutcomesFactory.create(number = 4)
      val eosr = endOfServiceReportFactory.create(
        submittedAt = OffsetDateTime.now(),
        outcomes = mutableSetOf(
          EndOfServiceReportOutcome(desiredOutcomes[0], AchievementLevel.ACHIEVED),
          EndOfServiceReportOutcome(desiredOutcomes[1], AchievementLevel.ACHIEVED),
          EndOfServiceReportOutcome(desiredOutcomes[2], AchievementLevel.PARTIALLY_ACHIEVED),
          EndOfServiceReportOutcome(desiredOutcomes[3], AchievementLevel.NOT_ACHIEVED),
        )
      )

      assertThat(eosr.achievementScore).isEqualTo(2.5f)
    }

    @Test
    fun `achievementScore returns 0 when there are no outcomes`() {
      val eosr = endOfServiceReportFactory.create(submittedAt = OffsetDateTime.now())
      assertThat(eosr.achievementScore).isEqualTo(0f)
    }
  }
}

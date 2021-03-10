package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import javax.persistence.Embeddable
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.ManyToOne
import javax.validation.constraints.NotNull

@Embeddable
data class EndOfServiceReportOutcome(
  @NotNull @ManyToOne(fetch = FetchType.LAZY) val desiredOutcome: DesiredOutcome,
  @Enumerated(EnumType.STRING)
  val achievementLevel: AchievementLevel,
  val progressionComments: String? = null,
  val additionalTaskComments: String? = null
)

enum class AchievementLevel {
  ACHIEVED, PARTIALLY_ACHIEVED, NOT_ACHIEVED
}

package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AchievementLevel
import java.util.UUID

data class CreateEndOfServiceReportOutcomeDTO(
  val desiredOutcomeId: UUID,
  val achievementLevel: AchievementLevel,
  val progressionComments: String? = null,
  val additionalTaskComments: String? = null
)

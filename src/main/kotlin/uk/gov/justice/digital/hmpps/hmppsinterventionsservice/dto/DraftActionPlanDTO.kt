package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import java.time.OffsetDateTime
import java.util.UUID

data class DraftActionPlanDTO(
  val id: UUID,
  val referralId: UUID,
  val numberOfSessions: Int?,
  val activities: List<DraftActionPlanActivityDTO> = emptyList(),
  val createdBy: AuthUserDTO,
  val createdAt: OffsetDateTime
)

data class DraftActionPlanActivityDTO(
  val desiredOutcome: DesiredOutcomeDTO,
  val description: String,
  val createdAt: OffsetDateTime
)

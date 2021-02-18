package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import java.time.OffsetDateTime
import java.util.UUID

data class CreateActionPlanDTO(
  val InterventionId: UUID,
  val numberOfSessions: Int?,
  val activities: List<CreateActionPlanActivityDTO>?
)

data class CreateActionPlanActivityDTO(
  val desiredOutcomeDTO: DesiredOutcomeDTO,
  val description: String,
  val createdAt: OffsetDateTime
)

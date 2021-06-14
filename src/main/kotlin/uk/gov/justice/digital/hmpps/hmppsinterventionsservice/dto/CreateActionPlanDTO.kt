package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import java.util.UUID

data class CreateActionPlanDTO(
  val referralId: UUID,
  val numberOfSessions: Int?,
  val activities: List<CreateActionPlanActivityDTO> = emptyList()
)

data class CreateActionPlanActivityDTO(
  val description: String
)

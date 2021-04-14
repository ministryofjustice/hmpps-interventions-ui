package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import java.util.UUID

data class UpdateActionPlanActivityDTO(
  val description: String?,
  val desiredOutcomeId: UUID?
)

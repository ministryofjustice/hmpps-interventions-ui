package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import java.util.UUID

data class SelectedDesiredOutcomesDTO(
  val serviceCategoryId: UUID,
  val desiredOutcomesIds: List<UUID>,
)

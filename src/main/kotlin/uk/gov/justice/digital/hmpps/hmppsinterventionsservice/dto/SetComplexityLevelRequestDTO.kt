package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import java.util.UUID

data class SetComplexityLevelRequestDTO(
  val serviceCategoryId: UUID,
  val complexityLevelId: UUID,
)
